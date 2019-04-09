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
  var roomCode;

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
      players: game.players
    });
  });

  //join an existing room
  socket.on('joinRoom', data => {
    let name = data.name;
    roomCode = data.roomCode;

    let player = new Player(socket.id, name, roomCode, 'Guest');
    socket.join(roomCode); //subscribe the socket to the roomcode

    console.log('Connecting player to game room: ' + roomCode);
    GameList[roomCode].players.push(player);

    console.log('GameList object after adding new player to existing game:');
    console.log(GameList);

    //emit all the game players to client, client then updates the UI
    io.in(roomCode).emit('updatePlayers', {
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

  //no other clients can join now that game is started
  //assign identities & assign first quest leader
  socket.on('startGame', function(data) {
    roomCode = data;
    GameList[roomCode].gameIsStarted = true;
    GameList[roomCode].gameStage = 1;
    GameList[roomCode].assignIdentities();
    GameList[roomCode].assignLeader();

    let players = GameList[roomCode].players;
    emitSanitizedPlayers(roomCode, players);
    io.in(roomCode).emit('identitiesAssigned');
  });

  socket.on('disconnect', function() {
    if (Object.keys(GameList).length != 0) {
      let players = GameList[roomCode].players;
      for (let i in players) {
        if (players[i].socketID === socket.id) {
          console.log('removing player from room: ' + roomCode);
          players.splice(i, 1); //delete 1 player element at index i
          break;
        }
      }
      //disconnection after game start
      if (GameList[roomCode].gameIsStarted) {
        emitSanitizedPlayers(roomCode, players);
      }
      //disconnection before game start
      else {
        //emit all the game players to client, client then updates the UI
        io.in(roomCode).emit('updatePlayers', {
          players: players
        });
      }
    }
  });
});

//server side validate instead of having the client validate
//client's only job is to update the UI
function emitSanitizedPlayers(roomCode, players) {
  for (let i in players) {
    if (players[i].character === 'Merlin') {
      //emit non-sanitized player list, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', { players: players });
    } else if (
      players[i].character === 'Minion of Mordred' ||
      players[i].character === 'Assassin'
    ) {
      let sanitizedPlayers = GameList[roomCode].sanitizeForEvilTeam();
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    } else {
      let sanitizedPlayers = GameList[roomCode].sanitizeForGoodTeam(
        players[i].socketID
      );
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    }
  }
}
