console.log('Hello world');

//File comunication with express
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

//create three arrays for sockets, game code and players
var SOCKET_LIST = {};
var PLAYER_LIST = {};
var PLAYER_NAME = {};

//create player attributes. x and y position, id and a number between 0 and 9
var Player = function(id, name, gameCode){
    var self = {
        x:400,
        y:300,
        id:id,
        name:name,
        gameCode:gameCode,
        pressingRight:false,
        pressingLeft:false,
        pressingUp:false,
        pressingDown:false,
        maxSpd:10
    }
    self.updatePosition = function(){
        if(self.pressingRight)
            self.x += self.maxSpd;
        if(self.pressingLeft)
            self.x -= self.maxSpd;
        if(self.pressingUp)
            self.y -= self.maxSpd;
        if(self.pressingDown)
            self.y += self.maxSpd;
    }
    return self;
}

var io = require('socket.io')(serv,{});




io.sockets.on('connection', function(socket){
    socket.on('roomCode', function(data){
        var code;
        socket.join(data.code);
        code = data.code;

        socket.on('startGame', function(){
            console.log('connected to room: ' + code);
            //assign the socket id a random number and add the socket to a socket list
            socket.id = Math.random();
            SOCKET_LIST[socket.id] = socket;
            var player;


            socket.on('playerName', function(data){
                PLAYER_NAME[socket.id] = data.name;
            });

            //create player and add it to the player list
            socket.on('createPlayer', function(){
                player = Player(socket.id, PLAYER_NAME[socket.id], code);
                PLAYER_LIST[socket.id] = player;
            });



            //if player disconnects, remove player from socket and player list
            socket.on('disconnect',function(){
                delete SOCKET_LIST[socket.id];
                delete PLAYER_LIST[socket.id];
            });

            socket.on('keyPress',function(data){
                if(data.inputId === 'left')
                    player.pressingLeft = data.state;
                else if(data.inputId === 'right')
                    player.pressingRight = data.state;
                else if(data.inputId === 'up')
                    player.pressingUp = data.state;
                else if(data.inputId === 'down')
                    player.pressingDown = data.state;
            });
        });
    });
});

setInterval(function(){
    var pack = [];

    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y,
            name:player.name,
            code:player.gameCode
        });
    }
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }
},1000/25);