import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';
import { gameSocket } from './socket/gameSocket.mjs';
import { handleRoomClick } from './socket/roomSocket.mjs';

const app = express();
const port = 3000;
const server = app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
const io = socketIO(server);
dotenv.config();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve("dist")));
  app.get(/.*/, function (req, res) {
    res.sendFile(path.resolve("dist/index.html"));
  });
}

export let Rooms = {}; //keeps record of all game objects

io.on('connection', async socket => {
  const { playerName, roomCode, reconnect } = await handleRoomClick(io, socket);
  console.log(roomCode)

  gameSocket(io, socket, port, Rooms[roomCode], playerName, roomCode, reconnect);
});
