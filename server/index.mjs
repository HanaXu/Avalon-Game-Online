import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import { sanitizeTeamView } from './game/utility.mjs';
import { createRoom, joinRoom } from './socket/roomListener.mjs';
import { gameListener, disconnectListener, reconnectPlayerToStartedGame } from './socket/gameListener.mjs';

const app = express();
const port = 3000;
const server = app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
const io = socketIO(server);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(__dirname + "/dist/"));
app.get(/.*/, function (req, res) {
  res.sendFile(__dirname + "/dist/index.html");
});

export let GameList = {}; //keeps record of all game objects
const requireAuth = false;

io.on('connection', socket => {
  socket.on('checkForAuth', () => {
    socket.emit('setAuth', requireAuth);
  });

  Promise.race([createRoom(io, socket, port), joinRoom(io, socket)])
    .then(({ name, roomCode, reconnect }) => {
      if (reconnect) {
        reconnectPlayerToStartedGame(io, socket, name, roomCode);
      }
      disconnectListener(io, socket, roomCode);
      gameListener(io, socket, roomCode);
    });
});

/**
 * @param {Object} io 
 * @param {Array} players 
 */
export function updatePlayerCards(io, players) {
  players.forEach(player => {
    io.to(player.socketID).emit('updatePlayerCards', sanitizeTeamView(player.socketID, player.character, players));
  });
}