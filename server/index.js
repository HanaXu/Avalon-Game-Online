const express = require('express');
// var Game = require("./game/Game");
// var Player = require("./game/Player");

const app = express();

const server = app.listen(3000, () => {
  console.log('server running on port 3000');
});

const io = require('socket.io')(server);

// var GameList = {}; //keeps record of all game objects

io.on('connection', socket => {
  socket.on('roomCode', data => {
    console.log(data.roomCode);
    console.log(data.name);

    socket.emit('received', 'hello');
  });
});
