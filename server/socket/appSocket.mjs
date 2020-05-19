import { createRoom, joinRoom, spectateRoom } from './roomSocket.mjs';
import { gameSocket } from './gameSocket.mjs';

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

  Promise.race([createRoom(io, socket), joinRoom(io, socket), spectateRoom(io, socket)])
    .then(({ playerName, roomCode, reconnect }) => {
      gameSocket(io, socket, port, roomCode, playerName, reconnect);
    });
}
