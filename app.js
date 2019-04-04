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
    let name;

    //check if this room already exists in GameList
    for (let i in GameList) {
      if (GameList[roomCode] != null) {
        console.log("room already exists");
        roomExists = true;
        break;
      }
    }
    if (!roomExists) {
      console.log("room does not exist. creating new game room");
      game = new Game(roomCode);
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
      io.in(roomCode).emit(roomCode + "SetUpTable", GameList[roomCode].players);

      //check for game ready
      if (GameList[roomCode].players.length >= 5) {
        console.log("game ready");
        let hostSocketID;

        //get host socket id
        let players = GameList[roomCode].players;
        for (let i in players) {
          if (players[i].role === "Host") {
            console.log("Host socket found");
            hostSocketID = players[i].socketID;
            break;
          }
        }
        io.to(hostSocketID).emit(roomCode + "gameReady"); //only emit to the host client
      }
    });

    //no other clients can join now that game is started (not yet implemented)
    //assign identities & assign first quest leader
    socket.on("startGameRoom", function() {
      // console.log("startGameRoom. this is the game list object");
      // console.log(GameList);
      // console.log("this is the game room object");
      // console.log(GameList[roomCode]);

      GameList[roomCode].gameIsClosed = 1; //true
      GameList[roomCode].gameStage = 1;
      GameList[roomCode].assignIdentities();
      GameList[roomCode].assignLeader();

      // console.log(GameList[roomCode].players);

      //emit all the game players to client, client then updates the canvas to show identities
      io.in(roomCode).emit(
        roomCode + "assignIdentities",
        GameList[roomCode].players
      );
    });

    //TODO: fix
    //disconnecting right now will reset the canvas to pregame setup
    //so if game is started and someone disconnects, will go back to pregame
    socket.on("disconnect", function() {
      let players = GameList[roomCode].players;
      for (let i in players) {
        if (players[i].socketID === socket.id) {
          console.log("removing player from game");
          players.splice(i,1); //delete 1 player element at index i
          break;
        }
      }
      //emit all the game players to client, client then updates the canvas
      io.in(roomCode).emit(
        roomCode + "SetUpTable",
        GameList[roomCode].players
      );
    });
  });
});
