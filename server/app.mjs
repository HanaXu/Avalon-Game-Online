import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';
import { gameSocket } from './socket/gameSocket.mjs';
import { handleRoomClick } from './socket/roomSocket.mjs';

const app = express();
const port = 3000;
const server = app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:8080'],
    methods: ['GET', 'POST'],
  },
});
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
  gameSocket(io, socket, port, Rooms[roomCode], playerName, roomCode, reconnect);
});
