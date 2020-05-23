import { GameRooms } from './gameSocket.mjs';
import Game from '../game/game.mjs';
import Player from '../game/player.mjs';
import { sanitizeTeamView } from '../game/utility.mjs';

/**
 * @param {Object} socket
 */
export function createRoom(socket) {
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
      GameRooms[roomCode].players.push(new Player(socket.id, playerName, roomCode, 'Host'));
      GameRooms[roomCode].chat.push({ id: Date.now(), serverMsg: `${playerName} has joined the game.` });

      socket.join(roomCode);
      socket.emit('goToGame', { playerName, roomCode });
      socket.emit('initChat', { msgs: GameRooms[roomCode].chat, showMsgInput: true });
      socket.emit('updatePlayerCards', GameRooms[roomCode].players);
      socket.emit('showSetupOptionsBtn', true);
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

      if (isPlayerReconnect(roomCode, playerName)) {
        resolve({ ...data, reconnect: true });
      }
      if (!isValidInput(socket, roomCode, playerName)) return;

      let game = GameRooms[roomCode];
      game.players.push(new Player(socket.id, playerName, roomCode, 'Guest'));
      socket.join(roomCode);
      socket.emit('goToGame', { playerName, roomCode });
      socket.emit('initChat', { msgs: game.chat, showMsgInput: true });
      updateServerChat(io, roomCode, `${playerName} has joined the game.`);
      io.in(roomCode).emit('updatePlayerCards', game.players);
      io.in(roomCode).emit('updateSpectatorsList', game.spectators);

      if (game.players.length >= 5) {
        io.to(game.getPlayer('type', 'Host').socketID).emit('showStartGameBtn', true);
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
      if (!isValidInput(socket, roomCode, playerName, true)) return;

      let game = GameRooms[roomCode];
      game.spectators.push(new Player(socket.id, playerName, roomCode, 'Spectator'));
      socket.join(roomCode);
      socket.emit('goToGame', { playerName, roomCode });
      socket.emit('initChat', { msgs: game.chat, showMsgInput: false });
      updateServerChat(io, roomCode, `${playerName} is spectating the game.`);

      if (game.gameIsStarted) {
        socket.emit('startGame', true);
        socket.emit('setRoleList', game.roleList);

        let currentQuest = game.getCurrentQuest();
        socket.emit('updateQuestCards', game.quests);
        socket.emit('updateGameStatus', game.gameState['status']);
        socket.emit('updateVoteTrack', currentQuest.voteTrack);
        if (currentQuest.teamVotesNeededLeft <= 0) {
          io.in(roomCode).emit('revealVoteResults', { type: 'team', votes: currentQuest.acceptOrRejectTeam });
        }
        if (game.winningTeam !== null) {
          io.in(roomCode).emit('updatePlayerCards', game.players);
        }
      }
      if (game.winningTeam === null) {
        game.spectators.forEach(spectator => {
          io.to(spectator.socketID).emit('updatePlayerCards', sanitizeTeamView(spectator.socketID, 'Spectator', game.players))
        });
      }
      io.in(roomCode).emit('updateSpectatorsList', game.spectators);
      resolve(data);
    });
  })
}

/**
 * @param {Object} io
 * @param {number} roomCode
 * @param {string} msg
 */
function updateServerChat(io, roomCode, msg) {
  const serverMsg = { id: Date.now(), serverMsg: msg };
  GameRooms[roomCode].chat.push(serverMsg);
  io.in(roomCode).emit('updateChat', serverMsg);
}

function generateRoomCode() {
  let roomCode = Math.floor(Math.random() * 999999) + 1;
  while (GameRooms.hasOwnProperty(roomCode)) {
    console.log(`collision with roomCode ${roomCode}`)
    roomCode = Math.floor(Math.random() * 999999) + 1;
  }
  console.log(`\ngenerating new room code ${roomCode}`)
  return roomCode;
}

function isPlayerReconnect(roomCode, playerName) {
  let game = GameRooms[roomCode];
  if (game && game.players) {
    return game.getPlayer('name', playerName) && game.getPlayer('name', playerName).disconnected;
  }
  return false;
}

function isValidInput(socket, roomCode, playerName, isSpectator=false) {
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
    errorMsg = 'Error: Cannot join a game that has already started.';
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
 */
function nameIsProperLength(playerName) {
  return playerName !== null && playerName.length > 0 && playerName.length <= 20;
}

/**
 * Make sure chosen optional roles works for number of players
 * If 5 or 6 players, cannot have more than 1 of Mordred, Oberon, and Morgana
 * @param {Object} roles 
 * @param {number} numPlayers 
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