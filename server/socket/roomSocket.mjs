import { GameList } from './appSocket.mjs';
import Game from '../game/game.mjs';
import Player from '../game/player.mjs';
import GameBot from '../game/gameBot.mjs';
import { sanitizeTeamView } from '../game/utility.mjs';

/**
 * @param {Object} io
 * @param {Object} socket
 * @param {Number} port
 */
export function createRoom(io, socket, port) {
  return new Promise((resolve) => {
    /**
     * @param {String} playerName 
     */
    socket.on('createRoom', function (playerName) {
      if (!validatePlayerCreatesRoom(socket, playerName)) return;

      const roomCode = generateRoomCode();
      socket.join(roomCode);
      socket.emit('passedValidation', { playerName, roomCode });
      settingsListener(socket, roomCode, port);

      GameList[roomCode] = new Game(roomCode);
      GameList[roomCode].players.push(new Player(socket.id, playerName, roomCode, 'Host'));
      GameList[roomCode].chat.push({ id: Date.now(), adminMsg: `${playerName} has joined the game.` });

      socket.emit('showSetupOptionsBtn', true);
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
      io.in(roomCode).emit('initChat', { msgs: GameList[roomCode].chat, showMsgInput: true });
      resolve({ playerName, roomCode });
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
      const { playerName, roomCode } = data;
      const player = GameList[roomCode].players.find(player => player.name === playerName);

      //reconnect disconnected player after the game has started
      if (GameList[roomCode] && player && player.disconnected === true) {
        resolve({ playerName, roomCode, reconnect: true });
      }
      //validate user input
      if (!validatePlayerJoinsRoom(socket, playerName, roomCode)) return;

      socket.join(roomCode);
      socket.emit('passedValidation', { playerName, roomCode });
      socket.emit('initChat', { msgs: GameList[roomCode].chat, showMsgInput: true });

      GameList[roomCode].players.push(new Player(socket.id, playerName, roomCode, 'Guest'));
      const msg = { id: Date.now(), adminMsg: `${playerName} has joined the game.` };
      GameList[roomCode].chat.push(msg);

      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
      io.in(roomCode).emit('updateSpectatorsList', GameList[roomCode].spectators);
      io.in(roomCode).emit('updateChat', msg);

      if (GameList[roomCode].players.length >= 5) {
        const hostSocketID = GameList[roomCode].players.find(player => player.type === 'Host').socketID;
        io.to(hostSocketID).emit('showStartGameBtn');
      }
      resolve(data);
    });
  })
}

/**
 * @param {Object} io 
 * @param {Object} socket 
 */
export function spectateRoom(io, socket) {
  return new Promise((resolve) => {
    /**
     * @param {Object} data
     */
    socket.on('spectateRoom', function (data) {
      const { playerName, roomCode } = data;

      //validate user input
      if (!validatePlayerSpectatesRoom(socket, playerName, roomCode)) return;

      socket.join(roomCode);
      socket.emit('passedValidation', { playerName, roomCode });
      socket.emit('initChat', { msgs: GameList[roomCode].chat, showMsgInput: false });

      GameList[roomCode].spectators.push(new Player(socket.id, playerName, roomCode, 'Spectator'));
      const msg = { id: Date.now(), adminMsg: `${playerName} is spectating the game.` };
      GameList[roomCode].chat.push(msg);

      if (GameList[roomCode].gameIsStarted) {
        socket.emit('startGame');
        socket.emit('setRoleList', GameList[roomCode].roleList);

        let currentQuest = GameList[roomCode].getCurrentQuest();
        socket.emit('updateQuestCards', GameList[roomCode].quests);
        socket.emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
        socket.emit('updateVoteTrack', currentQuest.voteTrack);
        if (currentQuest.teamVotesNeededLeft <= 0) {
          io.in(roomCode).emit('revealVoteStatus', { type: 'team', votes: currentQuest.acceptOrRejectTeam });
        }
      }
      GameList[roomCode].spectators.forEach(spectator => {
        io.to(spectator.socketID).emit('updatePlayerCards',
          sanitizeTeamView(spectator.socketID, 'Spectator', GameList[roomCode].players))
      });
      io.in(roomCode).emit('updateSpectatorsList', GameList[roomCode].spectators);
      io.in(roomCode).emit('updateChat', msg);

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
function validatePlayerCreatesRoom(socket, playerName) {
  if (playerName === null || playerName.length < 1 || playerName.length > 20) {
    console.log(`Error: Player name must be between 1-20 characters: ${playerName}`);
    socket.emit('updateErrorMsg', `Error: Player name must be between 1-20 characters: ${playerName}`);
    return false;
  }
  return true;
}

/**
 * @param {Object} socket 
 * @param {String} name 
 * @param {Number} roomCode 
 */
function validatePlayerJoinsRoom(socket, playerName, roomCode) {
  let errorMsg = "";

  if (typeof GameList[roomCode] === 'undefined') {
    errorMsg = `Error: Room code '${GameList[roomCode]}' does not exist.`;
  }
  else if (GameList[roomCode].gameIsStarted) {
    errorMsg = 'Error: Cannot join a game that has already started';
  } else if (playerName === null || playerName.length < 1 || playerName.length > 20) {
    errorMsg = `Error: Player name must be between 1-20 characters: ${playerName}`;
  } else if (GameList[roomCode].players.find(player => player.name === playerName)) {
    errorMsg = `Error: Player name '${playerName}' is already taken.`;
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

/**
 * @param {Object} socket 
 * @param {String} name 
 * @param {Number} roomCode 
 */
function validatePlayerSpectatesRoom(socket, playerName, roomCode) {
  let errorMsg = "";

  if (typeof GameList[roomCode] === 'undefined') {
    errorMsg = `Error: Room code '${GameList[roomCode]}' does not exist.`;
  }
  else if (playerName === null || playerName.length < 1 || playerName.length > 20) {
    errorMsg = `Error: Name must be between 1-20 characters: ${playerName}`;
  } else if (GameList[roomCode].players.find(player => player.name === playerName)
    || GameList[roomCode].spectators.find(spectator => spectator.name === playerName)) {
    errorMsg = `Error: Name '${playerName}' is already taken.`;
  }

  if (errorMsg.length > 0) {
    console.log(errorMsg);
    socket.emit('updateErrorMsg', errorMsg);
    return false;
  }
  return true;
}