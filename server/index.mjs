import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import { sanitizeTeamView } from './game/utility.mjs';
import {
  createRoom,
  joinRoom
} from './socket/roomListener.mjs';
import { gameListener } from './socket/gameListener.mjs';

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
    .then((data) => {
      const { name, roomCode } = data;
      gameListener(io, socket, name, roomCode);

      socket.on('disconnect', function () {
        if (Object.keys(GameList).length != 0 && typeof GameList[roomCode] !== 'undefined') {
          let players = GameList[roomCode].players;
          //disconnection after game start
          if (GameList[roomCode].gameIsStarted) {
            console.log('\ndisconnecting player from started game')
            GameList[roomCode].getPlayerBy('socketID', socket.id).disconnected = true;
            updatePlayerCards(io, players);
          }
          //disconnection before game start
          else {
            GameList[roomCode].deletePlayer(socket.id);
            io.in(roomCode).emit('updatePlayerCards', players);
          }
        }
      });
    });
});

export function updatePlayerCards(io, players) {
  players.forEach(player => {
    const sanitizedPlayers = sanitizeTeamView(player.socketID, player.character, players);
    io.to(player.socketID).emit('updatePlayerCards', sanitizedPlayers);
  });
}