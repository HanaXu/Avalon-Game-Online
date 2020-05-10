import { sanitizeTeamView } from '../game/utility.mjs';
import { createRoom, joinRoom } from './roomSocket.mjs';
import { gameSocket, reconnectPlayerToStartedGame } from './gameSocket.mjs';

export let GameList = {}; //keeps record of all game objects
// const requireAuth = false;

/**
 * @param {Object} io 
 * @param {Object} socket 
 * @param {Number} port 
 */
export function appSocket(io, socket, port) {
  // socket.on('checkForAuth', () => {
  //   socket.emit('setAuth', requireAuth);
  // });

  Promise.race([createRoom(io, socket, port), joinRoom(io, socket)])
    .then(({ playerName, roomCode, reconnect }) => {
      if (reconnect) {
        reconnectPlayerToStartedGame(io, socket, playerName, roomCode);
      }
      gameSocket(io, socket, roomCode);
    });
}

/**
 * @param {Object} io 
 * @param {Array} players 
 */
export function updatePlayerCards(io, players) {
  players.forEach(player => {
    io.to(player.socketID).emit('updatePlayerCards', sanitizeTeamView(player.socketID, player.role, players));
  });
}
