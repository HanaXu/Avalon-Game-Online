const express = require('express');
const app = express();
const server = app.listen(3000, () => {
  console.log('server running on port 3000');
});
const io = require('socket.io')(server);

var Game = require('../game/Game');
var Player = require('../game/Player');
var GameList = {}; //keeps record of all game objects

io.on('connection', socket => {
  //create a new room
  socket.on('createRoom', data => {
    roomCode = data.roomCode;
    const name = data.name;
    console.log(roomCode);
    console.log(name);

    socket.join(roomCode); //subscribe the socket to the roomcode

    let roomExists = false;
    let game;

    //check if this room already exists in GameList
    for (let i in GameList) {
      if (GameList[roomCode] != null) {
        console.log('room already exists');
        roomExists = true;
        break;
      }
    }
    if (!roomExists) {
      console.log('room does not exist. creating new game room');
      game = new Game(roomCode);
    }

    let player = new Player(socket.id, name, roomCode, 'Host');
    game.players.push(player);
    GameList[roomCode] = game;

    console.log('GameList object after adding game:');
    console.log(GameList);

    //emit all the game players to client, client then updates the UI
    io.in(roomCode).emit('updatePlayers', {
      roomCode: roomCode,
      players: game.players
    });
  });

  //join an existing room
  socket.on('joinRoom', data => {
    let name = data.name;
    let roomCode = data.roomCode;
    let player = new Player(socket.id, name, roomCode, 'Guest');
    socket.join(roomCode); //subscribe the socket to the roomcode

    console.log('Connecting player to game room: ' + roomCode);
    GameList[roomCode].players.push(player);

    console.log('GameList object after adding new player to existing game:');
    console.log(GameList);

    //emit all the game players to client, client then updates the UI
    io.in(roomCode).emit('updatePlayers', {
      roomCode: roomCode,
      players: GameList[roomCode].players
    });

    //check for game ready
    if (GameList[roomCode].players.length >= 5) {
      console.log('game ready');
      let hostSocketID;

      //get host socket id
      let players = GameList[roomCode].players;
      for (let i in players) {
        if (players[i].role === 'Host') {
          console.log('Host socket found');
          hostSocketID = players[i].socketID;
          break;
        }
      }
      io.to(hostSocketID).emit('gameReady'); //only emit to the host client
    }
  });

  socket.on('disconnect', function() {
    if (GameList.length != 0) {
      console.log('disconnecting from room: ' + roomCode);
      let players = GameList[roomCode].players;
      for (let i in players) {
        if (players[i].socketID === socket.id) {
          console.log('removing player from game');
          players.splice(i, 1); //delete 1 player element at index i
          break;
        }
      }
      //emit all the game players to client, client then updates the UI
      io.in(roomCode).emit('updatePlayers', {
        roomCode: roomCode,
        players: players
      });
    }
  });
});
