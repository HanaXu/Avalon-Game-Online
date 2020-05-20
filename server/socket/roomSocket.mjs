import { GameList } from './gameSocket.mjs';
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
      if (!validatePlayerNameMeetsRequirements(socket, playerName)) return;

      const roomCode = generateRoomCode();
      GameList[roomCode] = new Game(roomCode);
      GameList[roomCode].players.push(new Player(socket.id, playerName, roomCode, 'Host'));
      GameList[roomCode].chat.push({ id: Date.now(), serverMsg: `${playerName} has joined the game.` });

      join(socket, roomCode, playerName);
      socket.emit('updatePlayerCards', GameList[roomCode].players);
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

      //reconnect disconnected player after the game has started
      if (GameList[roomCode] && GameList[roomCode].players.find(player => player.name === playerName) &&
        GameList[roomCode].players.find(player => player.name === playerName).disconnected) {
        resolve({ playerName, roomCode, reconnect: true });
      }
      //validate user input
      if (!validateRoomCodeExists(socket, roomCode)) return;
      if (!validatePlayerNameMeetsRequirements(socket, playerName)) return;
      if (!validateNameIsAlreadyTaken(socket, roomCode, playerName)) return;
      if (!validateRoomHasCapacityAndGameDidNotStart(socket, roomCode)) return;

      join(socket, roomCode, playerName);
      GameList[roomCode].players.push(new Player(socket.id, playerName, roomCode, 'Guest'));
      updateServerChat(io, roomCode, `${playerName} has joined the game.`);
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
      io.in(roomCode).emit('updateSpectatorsList', GameList[roomCode].spectators);

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
      if (!validateRoomCodeExists(socket, roomCode)) return;
      if (!validatePlayerNameMeetsRequirements(socket, playerName)) return;
      if (!validateNameIsAlreadyTaken(socket, roomCode, playerName)) return;

      join(socket, roomCode, playerName);
      GameList[roomCode].spectators.push(new Player(socket.id, playerName, roomCode, 'Spectator'));
      updateServerChat(io, roomCode, `${playerName} is spectating the game.`);

      if (GameList[roomCode].gameIsStarted) {
        socket.emit('startGame');
        socket.emit('setRoleList', GameList[roomCode].roleList);

        let currentQuest = GameList[roomCode].getCurrentQuest();
        socket.emit('updateQuestCards', GameList[roomCode].quests);
        socket.emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
        socket.emit('updateVoteTrack', currentQuest.voteTrack);
        if (currentQuest.teamVotesNeededLeft <= 0) {
          io.in(roomCode).emit('revealVoteResults', { type: 'team', votes: currentQuest.acceptOrRejectTeam });
        }
        if (GameList[roomCode].winningTeam !== null) {
          io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
        }
      }
      if (GameList[roomCode].winningTeam === null) {
        GameList[roomCode].spectators.forEach(spectator => {
          io.to(spectator.socketID).emit('updatePlayerCards',
            sanitizeTeamView(spectator.socketID, 'Spectator', GameList[roomCode].players))
        });
      }
      io.in(roomCode).emit('updateSpectatorsList', GameList[roomCode].spectators);
      resolve(data);
    });
  })
}


/**
 * @param {Object} socket
 * @param {number} roomCode
 * @param {string} playerName
 */
function join(socket, roomCode, playerName) {
  socket.join(roomCode);
  socket.emit('goToGame', { playerName, roomCode });
  socket.emit('initChat', { msgs: GameList[roomCode].chat, showMsgInput: true });
}

/**
 * @param {Object} io
 * @param {number} roomCode
 * @param {string} msg
 */
function updateServerChat(io, roomCode, msg) {
  const serverMsg = { id: Date.now(), serverMsg: msg };
  GameList[roomCode].chat.push(serverMsg);
  io.in(roomCode).emit('updateChat', serverMsg);
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
 * @param {string} errorMsg 
 */
function logAndEmitError(socket, errorMsg) {
  console.log(errorMsg);
  socket.emit('updateErrorMsg', errorMsg)
}

/**
 * @param {Object} socket
 * @param {number} roomCode
 */
function validateRoomCodeExists(socket, roomCode) {
  if (typeof GameList[roomCode] === 'undefined') {
    logAndEmitError(socket, `Error: Room code '${GameList[roomCode]}' does not exist.`);
    return false;
  }
  return true;
}

/**
 * @param {Object} socket 
 * @param {string} playerName 
 */
function validatePlayerNameMeetsRequirements(socket, playerName) {
  if (playerName === null || playerName.length < 1 || playerName.length > 20) {
    logAndEmitError(socket, `Error: Player name must be between 1-20 characters: ${playerName}`);
    return false;
  }
  return true;
}

/**
 * @param {Object} socket
 * @param {number} roomCode
 * @param {string} playerName
 */
function validateNameIsAlreadyTaken(socket, roomCode, playerName) {
  if (GameList[roomCode].players.find(player => player.name === playerName)
    || GameList[roomCode].spectators.find(spectator => spectator.name === playerName)) {
    logAndEmitError(socket, `Error: Name '${playerName}' is already taken.`);
    return false;
  }
  return true;
}

/**
 * @param {Object} socket 
 * @param {number} roomCode 
 */
function validateRoomHasCapacityAndGameDidNotStart(socket, roomCode) {
  let errorMsg = "";

  if (GameList[roomCode].gameIsStarted) {
    errorMsg = 'Error: Cannot join a game that has already started';
  } else if (GameList[roomCode].players.length >= 10) {
    errorMsg = `Error: Room '${GameList[roomCode].roomCode}' has reached a capacity of 10`;
  }

  if (errorMsg.length > 0) {
    logAndEmitError(socket, errorMsg);
    return false;
  }
  return true;
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