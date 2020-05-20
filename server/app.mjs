import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import { createRoom, joinRoom, spectateRoom } from './socket/roomSocket.mjs';
import { gameSocket } from './socket/gameSocket.mjs';

const app = express();
const port = 3000;
const server = app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
const io = socketIO(server);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(__dirname + "/../dist/"));

app.get(/.*/, function (req, res) { //handle all other routes
  res.sendFile(path.resolve("dist/index.html"));
});

// const requireAuth = false;
io.on('connection', socket => {
  // socket.on('checkForAuth', () => {
  //   socket.emit('setAuth', requireAuth);
  // });
  Promise.race([createRoom(socket), joinRoom(io, socket), spectateRoom(io, socket)])
    .then(({ playerName, roomCode, reconnect }) => {
      gameSocket(io, socket, port, roomCode, playerName, reconnect);
    });
});
