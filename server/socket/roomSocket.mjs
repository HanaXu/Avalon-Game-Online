import { GameRooms } from './gameSocket.mjs';
import Game from '../game/game.mjs';
import { sanitizeTeamView } from '../game/utility.mjs';

/**
 * @param {Object} io
 * @param {Object} socket
 * @returns {Promise}
 */
export function createRoom(io, socket) {
  return new Promise((resolve) => {
    /**
     * @param {string} playerName
     */
    socket.on('createRoom', function (playerName) {
      if (!nameIsProperLength(playerName)) {
        return socket.emit('updateErrorMsg', 'Error: Name must be between 1-20 characters.');
      };

      const roomCode = generateRoomCode();
      GameRooms[roomCode] = new Game(roomCode);
      GameRooms[roomCode].addPerson({ type: 'player', socketID: socket.id, name: playerName, isRoomHost: true });

      socket.join(roomCode);
      socket.emit('goToGame', { playerName, roomCode });
      socket.emit('initChat', { msgs: GameRooms[roomCode].chat, showMsgInput: true });
      socket.emit('updatePlayerCards', GameRooms[roomCode].players);
      socket.emit('showSetupOptionsBtn', true);
      updateGameStatus(io, roomCode, `Waiting for ${5 - GameRooms[roomCode].players.length} more player(s) to join.`);
      resolve({ playerName, roomCode });
    });
  });
}

/**
 * @param {Object} io 
 * @param {Object} socket 
 * @returns {Promise}
 */
export function joinRoom(io, socket) {
  return new Promise((resolve) => {
    /**
     * @param {Object} data
     */
    socket.on('joinRoom', function (data) {
      const { playerName, roomCode } = data;

      if (isPlayerReconnect(roomCode, playerName)) {
        resolve({ ...data, reconnect: true });
      }
      if (!isValidInput(socket, roomCode, playerName)) return;

      socket.join(roomCode);
      socket.emit('goToGame', { playerName, roomCode });
      socket.emit('initChat', { msgs: GameRooms[roomCode].chat, showMsgInput: true });
      const msg = GameRooms[roomCode].addPerson({ type: 'player', socketID: socket.id, name: playerName, isRoomHost: false });
      io.to(roomCode).emit('updateChat', msg);
      io.in(roomCode).emit('updatePlayerCards', GameRooms[roomCode].players);
      io.in(roomCode).emit('updateSpectatorsList', GameRooms[roomCode].spectators);
      updateGameStatus(io, roomCode, `Waiting for ${5 - GameRooms[roomCode].players.length} more player(s) to join.`);

      if (GameRooms[roomCode].players.length >= 5) {
        io.to(GameRooms[roomCode].getPlayer('isRoomHost', true).socketID).emit('showStartGameBtn', true);
        updateGameStatus(io, roomCode, 'Waiting for Host to start the game.');
      }
      resolve(data);
    });
  })
}

/**
 * @param {Object} io 
 * @param {Object} socket 
 * @returns {Promise}
 */
export function spectateRoom(io, socket) {
  return new Promise((resolve) => {
    /**
     * @param {Object} data
     */
    socket.on('spectateRoom', function (data) {
      const { playerName, roomCode } = data;
      if (!isValidInput(socket, roomCode, playerName, true)) return;

      socket.join(roomCode);
      socket.emit('goToGame', { playerName, roomCode });
      socket.emit('initChat', { msgs: GameRooms[roomCode].chat, showMsgInput: false });
      socket.emit('updateGameStatus', GameRooms[roomCode].gameState['gameStatusMsg']);
      const msg = GameRooms[roomCode].addPerson({ type: 'spectator', socketID: socket.id, name: playerName, isRoomHost: false });
      io.in(roomCode).emit('updateChat', msg);
      io.in(roomCode).emit('updateSpectatorsList', GameRooms[roomCode].spectators);

      if (GameRooms[roomCode].gameIsStarted) emitGameStartedStuff(socket, roomCode);
      if (GameRooms[roomCode].winningTeam !== null) {
        socket.emit('updatePlayerCards', GameRooms[roomCode].players);
      } else {
        socket.emit('updatePlayerCards', sanitizeTeamView(socket.id, 'Spectator', GameRooms[roomCode].players));
      }
      resolve(data);
    });
  })
}

/**
 * @returns {number}
 */
function generateRoomCode() {
  let roomCode = Math.floor(Math.random() * 999999) + 1;
  while (GameRooms.hasOwnProperty(roomCode)) {
    console.log(`collision with roomCode ${roomCode}`)
    roomCode = Math.floor(Math.random() * 999999) + 1;
  }
  console.log(`\ngenerating new room code ${roomCode}`)
  return roomCode;
}

/**
 * @param {Object} io 
 * @param {number} roomCode 
 * @param {string} msg 
 */
function updateGameStatus(io, roomCode, msg) {
  GameRooms[roomCode].gameState['gameStatusMsg'] = msg;
  io.in(roomCode).emit('updateGameStatus', msg);
}

/**
 * @param {Object} socket 
 * @param {number} roomCode 
 */
function emitGameStartedStuff(socket, roomCode) {
  socket.emit('startGame', true);
  socket.emit('setRoleList', GameRooms[roomCode].roleList);

  let { voteTrack, teamVotesNeededLeft, acceptOrRejectTeam } = GameRooms[roomCode].getCurrentQuest();
  socket.emit('initQuests', GameRooms[roomCode].quests);
  socket.emit('updateGameStatus', GameRooms[roomCode].gameState['gameStatusMsg']);
  socket.emit('updateVoteTrack', voteTrack);
  if (teamVotesNeededLeft <= 0) {
    socket.emit('revealVoteResults', { type: 'team', votes: acceptOrRejectTeam });
  }
}

/**
 * @param {number} roomCode 
 * @param {string} playerName 
 * @returns {boolean} 
 */
function isPlayerReconnect(roomCode, playerName) {
  let game = GameRooms[roomCode];
  if (game && game.players) {
    return game.getPlayer('name', playerName) && game.getPlayer('name', playerName).disconnected;
  }
  return false;
}

/**
 * @param {Object} socket 
 * @param {number} roomCode 
 * @param {string} playerName 
 * @param {boolean} isSpectator 
 * @returns {boolean} 
 */
function isValidInput(socket, roomCode, playerName, isSpectator = false) {
  let errorMsg = '';
  if (!GameRooms[roomCode]) {
    errorMsg = `Error: Room '${roomCode}' does not exist.`;
  }
  else if (!nameIsProperLength(playerName)) {
    errorMsg = 'Error: Name must be between 1-20 characters.';
  }
  else if (GameRooms[roomCode].nameIsTaken(playerName)) {
    errorMsg = `Error: Name '${playerName}' is already taken.`;
  }
  else if (!isSpectator && GameRooms[roomCode].gameIsStarted) {
    errorMsg = 'Error: Cannot join a game that has already started. If you disconnected, enter the same name.';
  }
  else if (!isSpectator && GameRooms[roomCode].players.length >= 10) {
    errorMsg = `Error: Room '${roomCode}' has reached a capacity of 10.`;
  }
  if (errorMsg.length > 0) {
    console.log(errorMsg);
    socket.emit('updateErrorMsg', errorMsg);
    return false;
  }
  return true;
}

/**
 * @param {string} playerName 
 * @returns {boolean} 
 */
function nameIsProperLength(playerName) {
  return playerName !== null && playerName.length > 0 && playerName.length <= 20;
}

/**
 * Make sure chosen optional roles works for number of players
 * If 5 or 6 players, cannot have more than 1 of Mordred, Oberon, and Morgana
 * @param {Object} roles 
 * @param {number} numPlayers 
 * @returns {string} 
 */
export function validateOptionalRoles(roles, numPlayers) {
  const evilRoles = roles.filter((role) => role != "Percival");

  if (numPlayers <= 6 && evilRoles.length > 1) {
    return `Error: Games with 5 or 6 players can only include 1 optional evil role.
                  <br/>Please select only one, then click Start Game again.`;
  }
  else if ((numPlayers > 6 && numPlayers < 10) && evilRoles.length > 2) {
    return `Error: Games with 7, 8, or 9 players can only include 2 optional evil roles.
                  <br/>Please select only one, then click Start Game again.`;
  }
}