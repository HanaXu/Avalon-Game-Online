import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import { sanitizeTeamView } from './game/utility.mjs';
import { createRoom, joinRoom } from './socket/roomListener.mjs';
import { gameListener } from './socket/gameListener.mjs';
import { disconnectListener } from './socket/connectionListener.mjs';

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
    .then(({ roomCode }) => {

      socket.on('updateChat', (msg) => {
        GameList[roomCode].chat.push(msg);
        io.in(roomCode).emit('updateChat', msg);
      });

      disconnectListener(io, socket, roomCode);
      gameListener(io, socket, roomCode);
    });
});

export function updatePlayerCards(io, players) {
  players.forEach(player => {
    io.to(player.socketID).emit('updatePlayerCards', sanitizeTeamView(player.socketID, player.character, players));
  });
}

export function showSucceedAndFailBtnsToPlayersOnQuest(roomCode) {
  // updateQuestMsg('Quest team was Approved. Waiting for quest team to go on quest.');
  GameList[roomCode].gameState['questMsg'] = 'Quest team was Approved. Waiting for quest team to go on quest.';
  io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);

  GameList[roomCode].gameState['acceptOrRejectTeam'] = false;
  GameList[roomCode].gameState['succeedOrFailQuest'] = true;

  GameList[roomCode].players.forEach(player => {
    if (player.onQuest && !player.votedOnQuest) {
      const disableFailBtn = player.team === "Good"; //check if player is good so they can't fail quest
      io.to(player.socketID).emit('succeedOrFailQuest', disableFailBtn);
    }
  });
}