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
  var roomCode; //make roomCode available to socket

  //create a new room
  socket.on('createRoom', data => {
    roomCode = data.roomCode;
    const name = data.name;
    let roomExists = false;
    let game;

    //validation
    if (name.length < 1 || name.length > 20) {
      console.log('name does not meet length requirements: ' + name);
      socket.emit('errorMsg', 'Error: Name must be between 1-20 characters: ' + name);
      return;
    }

    socket.emit('passedValidation');
    socket.join(roomCode); //subscribe the socket to the roomcode

    //check if the room already exists in GameList
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

    //since player is Host, show them the game setup options (bots, optional characters)
    io.to(socket.id).emit('showHostSetupOptions');

    //emit all the game players to client, client then updates the UI
    io.in(roomCode).emit('updatePlayers', {
      players: game.players
    });
  });

  //join an existing room
  socket.on('joinRoom', data => {
    let name = data.name;
    roomCode = data.roomCode;

    //validate before letting player join a room
    if (GameList[roomCode] === undefined) {
      console.log('error joining room. room does not exist: ' + roomCode);
      socket.emit('errorMsg', "Error: Room code '" + roomCode + "' does not exist.");
      return;
    }
    else if (GameList[roomCode].gameIsStarted) {
      console.log('game has already started. cannot join');
      socket.emit('errorMsg', 'Error: Cannot join a game that has already started');
      return;
    }
    else if (name.length < 1 || name.length > 20) {
      console.log('name does not meet length requirements: ' + name);
      socket.emit('errorMsg', 'Error: Name must be between 1-20 characters: ' + name);
      return;
    }
    else if (GameList[roomCode].hasPlayerWithName(name)) {
      console.log('error someone already has name: ' + name);
      socket.emit('errorMsg', "Error: Name '" + name + "' is already taken.");
      return;
    }

    socket.emit('passedValidation');

    let player = new Player(socket.id, name, roomCode, 'Guest');
    socket.join(roomCode); //subscribe the socket to the roomcode

    console.log('Connecting player to game room: ' + roomCode);
    console.log('GameList object after adding new player to existing game:');

    GameList[roomCode].players.push(player);
    console.log(GameList);

    //emit all the game players to client, client then updates the UI
    io.in(roomCode).emit('updatePlayers', {
      players: GameList[roomCode].players
    });

    //check for game ready
    if (GameList[roomCode].players.length >= 5) {
      console.log('game ready');
      let hostSocketID = GameList[roomCode].getHostSocketID();
      io.to(hostSocketID).emit('gameReady'); //only emit to the host client
    }
  });

  //no other clients can join now that game is started
  //assign identities & assign first quest leader
  socket.on('startGame', function (data) {
    roomCode = data.roomCode;
    var optionalCharacters = data.optionalCharacters; //an array containing names of selected optional characters
    console.log("Optional characters are");
    console.log(optionalCharacters);

    let errorMsg = GameList[roomCode].validateOptionalCharacters(optionalCharacters);
    if (errorMsg.length > 0) {
      socket.emit('errorMsg', errorMsg);
      return;
    }
    GameList[roomCode].gameIsStarted = true;
    GameList[roomCode].gameStage = 1;
    GameList[roomCode].assignIdentities(optionalCharacters);
    GameList[roomCode].assignLeader();

    // console.log('Game object after start game:');
    // console.log(GameList[roomCode]);

    let players = GameList[roomCode].players;
    emitSanitizedPlayers(roomCode, players);
    io.in(roomCode).emit('identitiesAssigned');
  });

  socket.on('disconnect', function () {
    if (Object.keys(GameList).length != 0) {
      GameList[roomCode].deletePlayer(socket.id);
      let players = GameList[roomCode].players;

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
    if (players[i].character === 'Percival') {
      let sanitizedPlayers = GameList[roomCode].sanitizeForPercival(players[i].socketID);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    } else if (players[i].character === 'Merlin') {
      let sanitizedPlayers = GameList[roomCode].sanitizeForMerlin(players[i].socketID);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    } else if (players[i].character === 'Minion of Mordred' || players[i].character === 'Assassin' || players[i].character === 'Mordred' || players[i].character === 'Morgana') {
      let sanitizedPlayers = GameList[roomCode].sanitizeForEvilTeam(players[i].socketID);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    } else {
      let sanitizedPlayers = GameList[roomCode].sanitizeForGoodTeam(players[i].socketID);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    }
  }
}