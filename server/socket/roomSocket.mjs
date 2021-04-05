import { Rooms } from '../app.mjs';
import Game from '../game/game.mjs';
import { sanitizeTeamView } from '../game/utility.mjs';

/**
 * @param {Object} io
 * @param {Object} socket
 * @returns {Promise}
 */
export async function handleRoomClick(io, socket) {
  return new Promise((resolve) => {
    /**
     * @param {string} playerName
     */
    socket.on('createRoom', function (playerName) {
      if (!nameIsProperLength(playerName)) {
        return socket.emit('updateErrorMsg', 'Error: Name must be between 1-20 characters.');
      };

      const roomCode = generateRoomCode();
      Rooms[roomCode] = new Game(roomCode);
      Rooms[roomCode].addPerson({ type: 'player', socketID: socket.id, name: playerName, isRoomHost: true });

      socket.join(roomCode);
      socket.emit('goToLobby', { playerName, roomCode });
      socket.emit('initChat', { msgs: Rooms[roomCode].chat, showMsgInput: true });
      socket.emit('updatePlayerCards', Rooms[roomCode].players);
      socket.emit('showSetupOptionsBtn', true);
      updateGameStatus(io, roomCode, `Waiting for ${5 - Rooms[roomCode].players.length} more player(s) to join.`);
      resolve({ playerName, roomCode });
    });

    socket.on('joinRoom', function (data) {
      const { playerName, roomCode } = data;

      if (isPlayerReconnect(roomCode, playerName)) {
        clearTimeout(Rooms[roomCode].deleteRoomTimeout);
        return resolve({ ...data, reconnect: true });
      }
      if (!isValidInput(socket, roomCode, playerName)) return;
      clearTimeout(Rooms[roomCode].deleteRoomTimeout);

      socket.join(roomCode);
      socket.emit('goToLobby', { playerName, roomCode });
      socket.emit('initChat', { msgs: Rooms[roomCode].chat, showMsgInput: true });
      const msg = Rooms[roomCode].addPerson({ type: 'player', socketID: socket.id, name: playerName, isRoomHost: false });
      io.to(roomCode).emit('updateChat', msg);
      io.in(roomCode).emit('updatePlayerCards', Rooms[roomCode].players);
      io.in(roomCode).emit('updateSpectatorsList', Rooms[roomCode].spectators);
      io.in(roomCode).emit('updateSpecialRoles', Rooms[roomCode].specialRoles);
      updateGameStatus(io, roomCode, `Waiting for ${5 - Rooms[roomCode].players.length} more player(s) to join.`);

      if (Rooms[roomCode].players.length >= 5) {
        io.to(Rooms[roomCode].getPlayer('isRoomHost', true).socketID).emit('showStartGameBtn', true);
        updateGameStatus(io, roomCode, 'Waiting for Host to start the game.');
      }
      resolve(data);
    });

    socket.on('spectateRoom', function (data) {
      const { playerName, roomCode } = data;
      if (!isValidInput(socket, roomCode, playerName, true)) return;

      clearTimeout(Rooms[roomCode].deleteRoomTimeout);
      socket.join(roomCode);
      socket.emit('goToLobby', { playerName, roomCode });
      socket.emit('initChat', { msgs: Rooms[roomCode].chat, showMsgInput: false });
      socket.emit('updateGameStatus', Rooms[roomCode].gameState['gameStatusMsg']);
      const msg = Rooms[roomCode].addPerson({ type: 'spectator', socketID: socket.id, name: playerName, isRoomHost: false });
      io.in(roomCode).emit('updateChat', msg);
      io.in(roomCode).emit('updateSpectatorsList', Rooms[roomCode].spectators);
      io.in(roomCode).emit('updateSpecialRoles', Rooms[roomCode].specialRoles);

      if (Rooms[roomCode].isStarted) {
        emitGameStartedStuff(socket, playerName, roomCode);
      }
      if (Rooms[roomCode].winningTeam !== null) {
        socket.emit('updatePlayerCards', Rooms[roomCode].players);
      } else {
        socket.emit('updatePlayerCards', sanitizeTeamView(socket.id, 'Spectator', Rooms[roomCode].players));
      }
      resolve(data);
    });
  });
}

/**
 * @returns {number}
 */
function generateRoomCode() {
  let roomCode = Math.floor(Math.random() * 999999) + 1;
  while (Rooms.hasOwnProperty(roomCode)) {
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
  Rooms[roomCode].gameState['gameStatusMsg'] = msg;
  io.in(roomCode).emit('updateGameStatus', msg);
}

/**
 * @param {Object} socket 
 * @param {string} playerName 
 * @param {number} roomCode 
 */
function emitGameStartedStuff(socket, playerName, roomCode) {
  socket.emit('startGame', { startGame: true, playerName, roomCode });
  socket.emit('setRoleList', Rooms[roomCode].roleList);

  let { voteTrack, teamVotesNeededLeft, acceptOrRejectTeam } = Rooms[roomCode].getCurrentQuest();
  socket.emit('initQuests', Rooms[roomCode].quests);
  socket.emit('updateGameStatus', Rooms[roomCode].gameState['gameStatusMsg']);
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
  let game = Rooms[roomCode];
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
  if (!Rooms[roomCode]) {
    errorMsg = `Error: Room '${roomCode}' does not exist.`;
  }
  else if (!nameIsProperLength(playerName)) {
    errorMsg = 'Error: Name must be between 1-20 characters.';
  }
  else if (Rooms[roomCode].nameIsTaken(playerName)) {
    errorMsg = `Error: Name '${playerName}' is already taken.`;
  }
  else if (!isSpectator && Rooms[roomCode].isStarted) {
    errorMsg = 'Error: Cannot join a game that has already started. If you disconnected, enter the same name.';
  }
  else if (!isSpectator && Rooms[roomCode].players.length >= 10) {
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
