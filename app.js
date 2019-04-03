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

var Game = require("./game/Game");
var Player = require("./game/Player");
var GameList = {}; //keeps record of all game objects
const io = require("socket.io")(serv, {});

//start connection
io.on("connection", function(socket) {

  //start room connection
  socket.on("roomCode", function(data) {
    const roomCode = data.roomCode;
    console.log("got room code: " + roomCode);
    socket.join(roomCode); //subscribe the socket to the roomcode

    let roomExists = false;
    let game;
    //let roomCode;
    let name;

    //check if this room already exists in GameList
    for (let i in GameList) {
      if (GameList[roomCode] != null) {
        console.log("room already exists");
        roomExists = true;
        //gameIndex = i; //save the index where we found the game room with our roomcode
        break;
      }
    }
    if (!roomExists) {
      console.log("room does not exist. creating new game room");
      game = new Game(roomCode);
      console.log("game object for new room:");
      console.log(game);
    }
    console.log("connected to room: " + roomCode + "\n");
    
    socket.on("playerName", function(data) {
      name = data.name;
    });

    //create player and add it to the game object, then add game object to game list
    socket.on("createPlayer", function() {
      let player = new Player(socket.id, name, roomCode, "Host");
      game.players.push(player);
      GameList[roomCode] = game;
      console.log("GameList object after adding game:");
      console.log(GameList);

      console.log("This game object in GameList:");
      console.log(GameList[roomCode]);
      //emit all the game players to client, client then updates the canvas
      io.in(roomCode).emit(roomCode + "SetUpTable", game.players);

    });

    socket.on("connectPlayer", function() {
      let player = new Player(socket.id, name, roomCode, "Guest");

      console.log("Connecting player to game room");
      GameList[roomCode].players.push(player);
      console.log("GameList object after adding new player to existing game:");
      console.log(GameList);

      //emit all the game players to client, client then updates the canvas
      io.in(roomCode).emit(
        roomCode + "SetUpTable",
        GameList[roomCode].players
      );

      //check for game ready
      if(GameList[roomCode].players.length >= 5){
        console.log('game ready');
        let hostSocketID;

        //get host socket id
        let players = GameList[roomCode].players;
        for (let i in players) {
          if (players[i].role === 'Host') {
            console.log("Host found");
            hostSocketID = players[i].socketID;
            break;
          }
        }
        io.to(hostSocketID).emit(roomCode + "gameReady"); //only emit to the host client
      }
    });

    //no other clients can join now that game is started (not yet implemented)
    //assign identities
    socket.on("startGameRoom", function() {
      console.log('startGameRoom. this is the game list object');
      console.log(GameList);
      console.log('this is the game room object');
      console.log(GameList[roomCode]);
      GameList[roomCode].gameIsClosed = 1; //true
      GameList[roomCode].gameStage = 1;

      GameList[roomCode].assignIdentities();
      console.log(GameList[roomCode].players);
    });

    //right now, if the host leaves, the server crashes
    //works with guests leaving tho
    socket.on("disconnect", function() {
      let players = GameList[roomCode].players;
      for (let i in players) {
        if (players[i].socketID === socket.id) {
          console.log("removing player from game");
          delete players[i]; //delete the player

          //emit all the game players to client, client then updates the canvas
          io.in(roomCode).emit(
            roomCode + "SetUpTable",
            GameList[roomCode].players
          );
          break;
        }
      }
    });
  });
});

//dont need setinterval stuff b/c game is turn based

// setInterval(function() {
// const pack = [[], [], [], [], []];

// //loop through all the sockets in the server
// for (let i = 0, len = SocketList.length; i < len; i++) {
//   //GameStage 0 is users connecting
//   if (GameStage[i] === 0) {
//     //loop through sockets in a specific room
//     for (let j = 0, len2 = SocketList[i].length; j < len2; j++) {
//       if (GameIsClosed[i] === 1) {
//         //if socket does not exist move on to the next one
//         if (SocketList[i][j] != null) {
//           let socket = SocketList[i][j];
//           //send that socket the pack[i] which has all the players in that room so it sets up the table
//           socket.emit(GameList[i] + "setUpTable", pack[i]);
//           if (pack[i].length >= 5 && GameIsClosed[i] === 1) {
//             for (let k = 0, len2 = PlayerList[i].length; k < len2; k++) {
//               if (PlayerList[i][j].role === "Host") {
//                 SocketList[i][j].emit(GameList[i] + "gameReady");
//               }
//             }
//           }
//         }
//       }
//     }
//     // GameStage 1 = after host clicks start, assign identities & select first leader (in server)
//   } else if (GameStage[i] === 1) {
//     //assign identities and leader
//     assignIdentities(pack[i].length, i);
//     assignLeader(i);
//     //GameStage 2 = update client with identity info (all in client)
//   } else if (GameStage[i] === 2) {
//     //loop through all the sockets in a specific room and give all of them the pack[i] which as all player objects
//     for (let j = 0, len2 = SocketList[i].length; j < len2; j++) {
//       if (SocketList[i][j] != null) {
//         let socket = SocketList[i][j];
//         //emit pack as assignIdentities to client
//         socket.emit(GameList[i] + "assignIdentities", pack[i]);
//       }
//     }
//     GameStage[i] = 3;
//     //GameStage 3 = game loop; loops through all 5 quests
//   } else if (GameStage[i] === 3) {
//     //GameStage 4 = end of game; display winner and what not
//   } else if (GameStage[i] === 4) {
//   }
// }
// }, 1000 / 25);
