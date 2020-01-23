import { GameList, updatePlayerCards } from '../index.mjs';
import { reconnectPlayerToStartedGame } from './connectionListener.mjs';
import Game from '../game/game.mjs';
import Player from '../game/player.mjs';
import GameBot from '../game/gameBot.mjs';

export function createRoom(io, socket, port) {
  return new Promise((resolve) => {
    socket.on('createRoom', function (name) {
      if (!validatePlayerCreatesRoom(socket, name)) return;

      const roomCode = generateRoomCode();
      socket.join(roomCode);
      socket.emit('passedValidation', { name, roomCode });
      settingsListener(io, socket, roomCode, port);

      GameList[roomCode] = new Game(roomCode);
      GameList[roomCode].players.push(new Player(socket.id, name, roomCode, 'Host'));
      socket.emit('showSetupOptionsBtn', true);
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
      resolve({ name, roomCode });
    });
  });
}

export function joinRoom(io, socket) {
  return new Promise((resolve) => {
    socket.on('joinRoom', function (data) {
      const { name, roomCode } = data;

      //reconnect disconnected player after the game has started
      if (GameList[roomCode] && GameList[roomCode].getPlayerBy('name', name) &&
        GameList[roomCode].getPlayerBy('name', name).disconnected === true) {
        reconnectPlayerToStartedGame(io, socket, name, roomCode);
        return;
      }
      //validate user input
      if (!validatePlayerJoinsRoom(socket, name, roomCode)) return;

      socket.join(roomCode);
      socket.emit('passedValidation', { name, roomCode });
      GameList[roomCode].players.push(new Player(socket.id, name, roomCode, 'Guest'));

      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
      if (GameList[roomCode].players.length >= 5) {
        const hostSocketID = GameList[roomCode].getPlayerBy('role', 'Host').socketID;
        io.to(hostSocketID).emit('showStartGameBtn');
      }
      resolve(data);
    });
  })
}

function generateRoomCode() {
  let roomCode = Math.floor(Math.random() * 999999) + 1;
  while (GameList.hasOwnProperty(roomCode)) {
    console.log(`collision with roomCode ${roomCode}`)
    roomCode = Math.floor(Math.random() * 999999) + 1;
  }
  console.log(`\ngenerating new room code ${roomCode}`)
  return roomCode;
}

function settingsListener(io, socket, roomCode, port) {
  socket.on('createBot', function () {
    new GameBot(roomCode, port).startListening();
  });
}

function validatePlayerCreatesRoom(socket, name) {
  if (name === null || name.length < 1 || name.length > 20) {
    console.log(`Error: Name must be between 1-20 characters: ${name}`);
    socket.emit('updateErrorMsg', `Error: Name must be between 1-20 characters: ${name}`);
    return false;
  }
  return true;
}

function validatePlayerJoinsRoom(socket, name, roomCode) {
  let errorMsg = "";

  if (typeof GameList[roomCode] === 'undefined') {
    errorMsg = `Error: Room code '${GameList[roomCode]}' does not exist.`;
  }
  else if (GameList[roomCode].gameIsStarted) {
    errorMsg = 'Error: Cannot join a game that has already started';
  } else if (name === null || name.length < 1 || name.length > 20) {
    errorMsg = `Error: Name must be between 1-20 characters: ${name}`;
  } else if (GameList[roomCode].getPlayerBy('name', name)) {
    errorMsg = `Error: Name '${name}' is already taken.`;
  } else if (GameList[roomCode].players.length >= 10) {
    errorMsg = `Error: Room '${GameList[roomCode].roomCode}' has reached a capacity of 10`;
  }

  if (errorMsg.length > 0) {
    console.log(errorMsg);
    socket.emit('updateErrorMsg', errorMsg);
    return false;
  }
  return true;
}