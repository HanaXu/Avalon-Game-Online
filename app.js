console.log("Hello world");

//File comunication with express
let express = require("express");
let app = express();
let serv = require("http").Server(app);

var Player = require('./game/Player');

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

const SocketList = [[], [], [], [], []]; //Contains all sockets of clients
const PlayerList = [[], [], [], [], []]; //Contains all player objects
const PlayerCount = {}; //Keeps record of player count in each game
const GameIsClosed = {}; //value of 0 or 1 for each game. if 1 room is open, if 0 room is closed
const GameStage = {}; //keeps record of game stage in each room
const GameList = {}; //keeps record of all game codes
const PLAYER_NAME = {}; //used to set player name, but can be done without it

let gameRoomsCount = 0; //keeps record of how many game rooms there are

//constants used in assignIdentites function depending on how many players are connected when game is started
const PlayerIdentities = {
  "5": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred"
  ],
  "6": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred"
  ],
  "7": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred",
    "Minion of Mordred"
  ],
  "8": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred",
    "Minion of Mordred"
  ],
  "9": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred",
    "Minion of Mordred"
  ],
  "10": [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred",
    "Minion of Mordred",
    "Minion of Mordred"
  ]
};
const GoodTeam = new Set(["Merlin", "Loyal Servant of Arthur"]);

let quest1, quest2, quest3, quest4, quest5;
let quests = [quest1, quest2, quest3, quest4, quest5];

//assigns each player an identity in the game
function assignIdentities(numberOfPlayers, roomNumber) {
  console.log("assignIdentities()");
  var shuffledIdentities = shuffle(PlayerIdentities[numberOfPlayers]);
  
  //x = index of shuffledIdentities array
  var x = 0;
  //loops through the player list, if it is not null assign an identity from the shuffled Identities
  for (var i = 0; i < PlayerList[roomNumber].length; i++) {
    if (PlayerList[roomNumber][i] != null) {
      PlayerList[roomNumber][i].character = shuffledIdentities[x];
      //if the identity merlin or loyal servant of arthur set team to good, else to evil
      if (GoodTeam.has(shuffledIdentities[x])) {
        PlayerList[roomNumber][i].team = "Good";
      } else {
        PlayerList[roomNumber][i].team = "Evil";
      }
      x++;
    }
  }
}

//randomly assign a room leader in the player list.
function assignLeader(roomNumber) {
  var randomNumber = Math.floor(
    Math.random() * Math.floor(PlayerList[roomNumber].length)
  );
  for (var i = 0; i < PlayerList[roomNumber].length; i++) {
    if (PlayerList[roomNumber][i] != null) {
      PlayerList[roomNumber][i].leader = true;
      break;
    }
  }
  GameStage[roomNumber] = 2;
}

//shuffle the array
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const io = require("socket.io")(serv, {});

//start connection
io.sockets.on("connection", function(socket) {
  //start room connection
  socket.on("roomCode", function(data) {
    const code = data.code;
    let roomNumber;
    let playerPosition;
    let exist = false;
    socket.join(data.code);

    //go through game list and if it exists or open connect the player to a game
    for (let i in GameList) {
      if (GameList[i] === code && GameIsClosed[gameRoomsCount - 1] === 1) {
        roomNumber = i;
        PlayerCount[roomNumber] = PlayerCount[roomNumber] + 1;
        playerPosition = PlayerList[i].length;
        exist = true;
        console.log(
          "Connected to Game: " +
            code +
            " room number: " +
            roomNumber +
            " player position: " +
            playerPosition
        );
        break;
      }
    }

    //if game does not exist add game stuff
    if (!exist) {
      PlayerCount[gameRoomsCount] = 0;
      GameStage[gameRoomsCount] = 0;
      GameIsClosed[gameRoomsCount] = 1;
      GameList[gameRoomsCount] = code;
      roomNumber = gameRoomsCount;
      playerPosition = 0;
      gameRoomsCount = gameRoomsCount + 1;
      console.log(
        "Created New Game: " +
          code +
          " room number: " +
          roomNumber +
          " player position: " +
          playerPosition
      );
    }

    //if room is open create and connect player to game
    if (GameIsClosed[roomNumber] === 1) {
      socket.on("startGame", function() {
        console.log("connected to room: " + code);
        var player;

        socket.on("playerName", function(data) {
          PLAYER_NAME[PlayerCount[roomNumber]] = data.name;
        });

        //create player and add it to the player list
        socket.on("createPlayer", function() {
          SocketList.push(roomNumber);
          SocketList[roomNumber].push(PlayerCount[roomNumber]);
          SocketList[roomNumber][PlayerCount[roomNumber]] = socket;
          console.log(SocketList);
          player = new Player(
            socket.id,
            PLAYER_NAME[PlayerCount[roomNumber]],
            code,
            "Host",
            playerPosition
          );

          PlayerList.push(roomNumber);
          PlayerList[roomNumber].push(PlayerCount[roomNumber]);
          PlayerList[roomNumber][PlayerCount[roomNumber]] = player;
          console.log(PlayerList);
          console.log(
            "Room " +
              roomNumber +
              " SocketList: " +
              SocketList[roomNumber] +
              ". PlayerList: " +
              PlayerList[roomNumber] +
              ". Socket Ids: " +
              ". PlayerPosition: " +
              playerPosition
          );
        });

        socket.on("connectPlayer", function() {
          SocketList[roomNumber].push(PlayerCount[roomNumber]);
          SocketList[roomNumber][PlayerCount[roomNumber]] = socket;
          player = new Player(
            socket.id,
            PLAYER_NAME[PlayerCount[roomNumber]],
            code,
            "Guest",
            playerPosition
          );

          PlayerList[roomNumber].push(PlayerCount[roomNumber]);
          PlayerList[roomNumber][PlayerCount[roomNumber]] = player;
          console.log(
            "Room " +
              roomNumber +
              " SocketList: " +
              SocketList[roomNumber] +
              ". PlayerList: " +
              PlayerList[roomNumber] +
              ". Socket Ids: " +
              ". PlayerPosition: " +
              playerPosition
          );
        });

        socket.on("startGameRoom", function() {
          GameIsClosed[roomNumber] = 0;
          GameStage[roomNumber] = 1;
        });

        //if player disconnects, remove player stuff in array
        socket.on("disconnect", function() {
          if (PlayerList[roomNumber][playerPosition].role === "Host") {
            delete SocketList[roomNumber][playerPosition];
            delete PlayerList[roomNumber][playerPosition];
            if (PlayerList[roomNumber].length > 0) {
              for (
                let j = 0, len2 = PlayerList[roomNumber].length;
                j < len2;
                j++
              ) {
                if (PlayerList[roomNumber][j] != null) {
                  PlayerList[roomNumber][j].role = "Host";
                  break;
                }
              }
            }
            socket.emit(
              GameList[roomNumber] + "setUpTable",
              PlayerList[roomNumber]
            );
            console.log(
              "Room " +
                roomNumber +
                " SocketList: " +
                SocketList[roomNumber] +
                ". PlayerList: " +
                PlayerList[roomNumber] +
                ". PlayerPosition: " +
                playerPosition
            );
          } else {
            delete SocketList[roomNumber][playerPosition];
            delete PlayerList[roomNumber][playerPosition];
            socket.emit(
              GameList[roomNumber] + "setUpTable",
              PlayerList[roomNumber]
            );
            console.log(
              "Room " +
                roomNumber +
                " SocketList: " +
                SocketList[roomNumber] +
                ". PlayerList: " +
                PlayerList[roomNumber] +
                ". PlayerPosition: " +
                playerPosition
            );
          }
        });
      });
    }
  });
});

setInterval(function() {
  const pack = [[], [], [], [], []];
  //loop through all the players in the server
  for (let i = 0, len = PlayerList.length; i < len; i++) {
    //loop through all the players in a specific room
    for (let j = 0, len2 = PlayerList[i].length; j < len2; j++) {
      //if player does not exist, move on to next. if they do exist, update their attributes by pushing it to pack
      if (PlayerList[i][j] != null) {
        let player = PlayerList[i][j];
        pack[i].push({
          id: player.id,
          name: player.name,
          code: player.gameCode,
          role: player.role,
          turn: player.turn,
          team: player.team,
          character: player.character,
          leader: player.leader,
          quest_action: player.quest_action,
          quest_approval: player.quest_approval,
          action: player.action
        });
      }
    }
  }

  //loop through all the sockets in the server
  for (let i = 0, len = SocketList.length; i < len; i++) {
    //GameStage 0 is users connecting
    if (GameStage[i] === 0) {
      //loop through sockets in a specific room
      for (let j = 0, len2 = SocketList[i].length; j < len2; j++) {
        if (GameIsClosed[i] === 1) {
          //if socket does not exist move on to the next one
          if (SocketList[i][j] != null) {
            let socket = SocketList[i][j];
            //send that socket the pack[i] which has all the players in that room so it sets up the table
            socket.emit(GameList[i] + "setUpTable", pack[i]);
            if (pack[i].length >= 5 && GameIsClosed[i] === 1) {
              for (let k = 0, len2 = PlayerList[i].length; k < len2; k++) {
                if (PlayerList[i][j].role === "Host") {
                  SocketList[i][j].emit(GameList[i] + "gameReady");
                }
              }
            }
          }
        }
      }
      // GameStage 1 = after host clicks start, assign identities & select first leader (in server)
    } else if (GameStage[i] === 1) {
      //assign identities and leader
      assignIdentities(pack[i].length, i);
      assignLeader(i);
      //GameStage 2 = update client with identity info (all in client)
    } else if (GameStage[i] === 2) {
      //loop through all the sockets in a specific room and give all of them the pack[i] which as all player objects
      for (let j = 0, len2 = SocketList[i].length; j < len2; j++) {
        if (SocketList[i][j] != null) {
          let socket = SocketList[i][j];
          //emit pack as assignIdentities to client
          socket.emit(GameList[i] + "assignIdentities", pack[i]);
        }
      }
      GameStage[i] = 3;
      //GameStage 3 = game loop; loops through all 5 quests
    } else if (GameStage[i] === 3) {
      //GameStage 4 = end of game; display winner and what not
    } else if (GameStage[i] === 4) {
    }
  }
}, 1000 / 25);
