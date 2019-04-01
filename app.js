console.log("Hello world");

//File comunication with express
let express = require("express");
let app = express();
let serv = require("http").Server(app);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

//create three arrays for sockets, game code and players
const SocketList = [[], [], [], [], []]; //[room index: 0,1,2..] [socket.id]
const PlayerList = [[], [], [], [], []]; //[room index: 0,1,2..] [socket.id]
const SocketIDS = [[], [], [], [], []]; //[room index: 0,1,2..] [player index: 0,1,2..]

const GameIsClosed = {}; //states if the game is open or closed
const AssignIdentities = {};
const GameList = {}; // [room index] = the room code
const PlayerName = {};
let gameRoomsCount = 0;

// key = number of players
// value = list of characters
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

const Good = new Set(["Merlin", "Loyal Servant of Arthur"]);
const Evil = new Set(["Assassin", "Minion of Mordred"]);

let quest1, quest2, quest3, quest4, quest5;

let quests = [quest1, quest2, quest3, quest4, quest5];

//takes 3 param and sets players roles based on their length.
function assignIdentities(numberOfPlayers, roomNumber, socket_id) {
  console.log("assignIdentities()");
  var shuffledIdentities = shuffle(PlayerIdentities[numberOfPlayers]);

  for (var i = 0; i < PlayerList[roomNumber].length; i++) {
    PlayerList[roomNumber][socket_id[i]].character = shuffledIdentities[i];
    if (Good.has(shuffledIdentities[i])) {
      PlayerList[roomNumber][socket_id[i]].team = "Good";
    } else {
      PlayerList[roomNumber][socket_id[i]].team = "Evil";
    }
  }

  //I did not assign any players their identities yet, not sure how the players are being passed
  AssignIdentities[roomNumber] = 2;

  //fisher-yates algorithm
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
      AssignIdentities[gameRoomsCount] = 0;
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
    if (GameIsClosed[gameRoomsCount - 1] === 1) {
      socket.on("startGame", function() {
        console.log("connected to room: " + code);
        //assign the socket id a random number and add the socket to a socket list
        socket.id = Math.random();

        var player;

        socket.on("playerName", function(data) {
          PlayerName[socket.id] = data.name;
        });

        //create player and add it to the player list
        socket.on("createPlayer", function() {
          SocketList.push(roomNumber);
          SocketList[roomNumber].push(socket.id);
          SocketList[roomNumber][socket.id] = socket;
          console.log(SocketList);
          SocketIDS.push(roomNumber);
          SocketIDS[roomNumber].push(playerPosition);
          SocketIDS[roomNumber][playerPosition] = socket.id;
          console.log(SocketIDS);
          let player = new Player(socket.id, PlayerName[socket.id], code, 'Host', playerPosition);

          PlayerList.push(roomNumber);
          PlayerList[roomNumber].push(socket.id);
          PlayerList[roomNumber][socket.id] = player;
          console.log(PlayerList);
        });

        socket.on("connectPlayer", function() {
          SocketList[roomNumber].push(socket.id);
          SocketList[roomNumber][socket.id] = socket;
          SocketIDS[roomNumber].push(playerPosition);
          SocketIDS[roomNumber][playerPosition] = socket.id;
          let player = new Player(socket.id, PlayerName[socket.id], code, 'Guest', playerPosition);

          PlayerList[roomNumber].push(socket.id);
          PlayerList[roomNumber][socket.id] = player;
        });

        socket.on("startGameRoom", function() {
          GameIsClosed[roomNumber] = 0;
          AssignIdentities[roomNumber] = 1;
        });

        //if player disconnects, remove player stuff in array
        socket.on("disconnect", function() {
          delete SocketList[roomNumber][socket.id];
          delete PlayerList[roomNumber][socket.id];
          delete PlayerName[socket.id];
          delete SocketIDS[roomNumber][playerPosition];
          socket.emit(
            GameList[roomNumber] + "setUpTable",
            PlayerList[roomNumber]
          );
        });
      });
    }
  });
});

setInterval(function() {
  const pack = [[], [], [], [], []];
  let socket_id;
  for (let i = 0, len = PlayerList.length; i < len; i++) {
    for (let j = 0, len2 = PlayerList[i].length; j < len2; j++) {
      socket_id = SocketIDS[i][j];
      if (socket_id !== null) {
        let player = PlayerList[i][socket_id];
        pack[i].push({
          id: player.id,
          name: player.name,
          code: player.gameCode,
          role: player.role,
          turn: player.turn,
          team: player.team,
          character: player.character,
          action: player.action
        });
      }
    }
  }
  for (let i = 0, len = SocketList.length; i < len; i++) {
    for (let j = 0, len2 = SocketList[i].length; j < len2; j++) {
      if (GameIsClosed[i] === 1) {
        socket_id = SocketIDS[i][j];
        if (socket_id !== null) {
          let socket = SocketList[i][socket_id];
          socket.emit(GameList[i] + "setUpTable", pack[i]);
          if (pack[i].length >= 5 && GameIsClosed[i] === 1) {
            SocketList[i][SocketIDS[i][0]].emit(GameList[i] + "gameReady");
          }
        }
      } else if (AssignIdentities[i] === 1) {
        assignIdentities(pack[i].length, i, SocketIDS[i]);
      } else if (AssignIdentities[i] === 2) {
        for (let j = 0, len2 = SocketList[i].length; j < len2; j++) {
          socket_id = SocketIDS[i][j];
          if (socket_id !== null) {
            let socket = SocketList[i][socket_id];
            socket.emit(GameList[i] + "assignIdentities", pack[i]);
          }
        }
      }
    }
  }
}, 1000 / 25);
