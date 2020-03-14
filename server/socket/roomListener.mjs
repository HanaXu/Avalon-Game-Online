import { GameList } from '../index.mjs';
import Game from '../game/game.mjs';
import Player from '../game/player.mjs';
import GameBot from '../game/gameBot.mjs';

/**
 * @param {Object} io
 * @param {Object} socket
 * @param {Number} port
 */
export function createRoom(io, socket, port) {
  return new Promise((resolve) => {
    /**
     * @param {String} name
     */
    socket.on('createRoom', function (name) {
      if (!validatePlayerCreatesRoom(socket, name)) return;

      const roomCode = generateRoomCode();
      socket.join(roomCode);
      socket.emit('passedValidation', { name, roomCode });
      settingsListener(socket, roomCode, port);

      GameList[roomCode] = new Game(roomCode);
      GameList[roomCode].players.push(new Player(socket.id, name, roomCode, 'Host'));
      GameList[roomCode].chat.push({ id: Date.now(), adminMsg: `${name} has joined the game.` });

      socket.emit('showSetupOptionsBtn', true);
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
      io.in(roomCode).emit('initChat', GameList[roomCode].chat);
      resolve({ name, roomCode });
    });
  });
}

/**
 * @param {Object} io 
 * @param {Object} socket 
 */
export function joinRoom(io, socket) {
  return new Promise((resolve) => {
    /**
     * @param {Object} data
     */
    socket.on('joinRoom', function (data) {
      const { name, roomCode } = data;

      //reconnect disconnected player after the game has started
      if (GameList[roomCode] && GameList[roomCode].getPlayerBy('name', name) &&
        GameList[roomCode].getPlayerBy('name', name).disconnected === true) {
        resolve({name, roomCode, reconnect: true});
      }
      //validate user input
      if (!validatePlayerJoinsRoom(socket, name, roomCode)) return;

      socket.join(roomCode);
      socket.emit('passedValidation', { name, roomCode });
      socket.emit('initChat', GameList[roomCode].chat);

      GameList[roomCode].players.push(new Player(socket.id, name, roomCode, 'Guest'));
      const msg = { id: Date.now(), adminMsg: `${name} has joined the game.` };
      GameList[roomCode].chat.push(msg);

      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
      io.in(roomCode).emit('updateChat', msg);

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

/**
 * @param {Object} socket 
 * @param {Number} roomCode 
 * @param {Number} port 
 */
function settingsListener(socket, roomCode, port) {
  socket.on('createBot', function () {
    new GameBot(roomCode, port).startListening();
  });
}

/**
 * @param {Object} socket 
 * @param {String} name 
 */
function validatePlayerCreatesRoom(socket, name) {
  if (name === null || name.length < 1 || name.length > 20) {
    console.log(`Error: Name must be between 1-20 characters: ${name}`);
    socket.emit('updateErrorMsg', `Error: Name must be between 1-20 characters: ${name}`);
    return false;
  }
  return true;
}

/**
 * @param {Object} socket 
 * @param {String} name 
 * @param {Number} roomCode 
 */
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