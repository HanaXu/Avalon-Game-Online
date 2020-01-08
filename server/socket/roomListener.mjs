import { GameList, updatePlayerCards } from '../index.mjs';
import { validateOptionalCharacters } from '../game/utility.mjs';
import Game from '../game/game.mjs';
import Player from '../game/player.mjs';
import GameBot from '../game/gameBot.mjs';

export function createRoom(io, socket, port) {
  return new Promise((resolve) => {
    socket.on('createRoom', function (name) {
      //validate user input
      if (name === null || name.length < 1 || name.length > 20) {
        console.log(`Error: Name does not meet length requirements: ${name}`);
        socket.emit('updateErrorMsg', `Error: Name must be between 1-20 characters: ${name}`);
        return;
      }
      let roomCode = generateRoomCode();
      socket.emit('passedValidation', {name, roomCode});
      socket.join(roomCode); //subscribe the socket to the roomcode
      resolve({name, roomCode});
      settingsListener(io, socket, roomCode, port);

      GameList[roomCode] = new Game(roomCode);
      GameList[roomCode].players.push(new Player(socket.id, name, roomCode, 'Host'));
      socket.emit('showHostSetupOptionsBtn', true);
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    });
  });
}

export function joinRoom(io, socket) {
  return new Promise((resolve) => {
    socket.on('joinRoom', function (data) {
      const roomCode = data.roomCode;
      const name = data.name;
      //reconnect disconnected player after the game has started
      if (GameList[roomCode] && GameList[roomCode].getPlayerBy('name', name) &&
        GameList[roomCode].getPlayerBy('name', name).disconnected === true) {
        reconnectPlayerToStartedGame(name);
        return;
      }
      //validate user input
      const errorMsg = validatePlayerJoinsRoom(name, roomCode);
      if (errorMsg.length > 0) {
        socket.emit('updateErrorMsg', errorMsg);
        return;
      }
      socket.emit('passedValidation', {name, roomCode});
      socket.join(roomCode);
      resolve(data);
      GameList[roomCode].players.push(new Player(socket.id, name, roomCode, 'Guest'));
  
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
      io.in(roomCode).emit('updateChallengeMode', GameList[roomCode].challengeMode);
      if (GameList[roomCode].players.length >= 5) {
        const hostSocketID = GameList[roomCode].getPlayerBy('role', 'Host').socketID;
        io.to(hostSocketID).emit('showStartGameBtn');
      }
    });
  })
}

export function startGame(io, socket, roomCode) {
  return new Promise((resolve) => {
    socket.on('startGame', function (optionalCharacters) {
      const errorMsg = validateOptionalCharacters(optionalCharacters, GameList[roomCode].players.length);
      if (errorMsg.length > 0) {
        socket.emit('updateErrorMsg', errorMsg);
        return;
      }

      GameList[roomCode].startGame(optionalCharacters);
      updatePlayerCards(GameList[roomCode].players);
      io.in(roomCode).emit('startGame');
      io.to(socket.id).emit('showHostSetupOptionsBtn', false);
      io.in(roomCode).emit('setRoleList', {
        good: GameList[roomCode].roleList["good"],
        evil: GameList[roomCode].roleList["evil"]
      });
      //empty the history modal in case player is still in same session from a previous game
      io.in(roomCode).emit('updateHistoryModal', []);
      resolve();
    });
  })
}

function generateRoomCode() {
  let roomCode = Math.floor(Math.random() * 999999) + 1;
  console.log(GameList)
  //check if the room already exists
  while (GameList.hasOwnProperty(roomCode)) {
    console.log(`collision with roomCode ${roomCode}`)
    roomCode = Math.floor(Math.random() * 999999) + 1;
  }
  console.log(`generating new room code ${roomCode}`)
  return roomCode;
}

function settingsListener(io, socket, roomCode, port) {
  socket.on('challengeMode', function (mode) {
    GameList[roomCode].challengeMode = mode;
    io.in(roomCode).emit('updateChallengeMode', mode);
  });

  socket.on('createBot', function () {
    new GameBot(roomCode, port).startListening();
  });
}

function validatePlayerJoinsRoom(name, roomCode) {
  if (typeof GameList[roomCode] === 'undefined') {
    console.log(`Error: Room code '${game.roomCode}' does not exist.`);
    return `Error: Room code '${game.roomCode}' does not exist.`;
  }
  else if (GameList[roomCode].gameIsStarted) {
    console.log('Error: Cannot join a game that has already started');
    return 'Error: Cannot join a game that has already started';
  } else if (name === null || name.length < 1 || name.length > 20) {
    console.log(`Error: Name must be between 1-20 characters: ${name}`);
    return `Error: Name must be between 1-20 characters: ${name}`;
  } else if (GameList[roomCode].getPlayerBy('name', name)) {
    console.log(`Error: Name '${name}' is already taken.`);
    return `Error: Name '${name}' is already taken.`;
  } else if (GameList[roomCode].players.length >= 10) {
    console.log(`Error: Room '${GameList[roomCode].roomCode}' has reached a capacity of 10`);
    return `Error: Room '${GameList[roomCode].roomCode}' has reached a capacity of 10`;
  }
  else {
    return "";
  }
}