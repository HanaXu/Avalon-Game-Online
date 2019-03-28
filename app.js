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
var SOCKET_LIST = [[],[],[],[],[]]; //[room index: 0,1,2..] [socket.id]
var PLAYER_LIST = [[],[],[],[],[]]; //[room index: 0,1,2..] [socket.id]
var SOCKET_IDS = [[],[],[],[],[]]; //[room index: 0,1,2..] [player index: 0,1,2..]
var GAME_LIST = {}; // [room index] = the room code
var PLAYER_NAME = {};
var gameRoomsCount = 0;

//create player attributes. x and y position, id and a number between 0 and 9
var Player = function(id, name, gameCode, role, playerPosition){
    var self = {
        x:400,
        y:300,
        id:id,
        name:name,
        gameCode:gameCode,
        role:role,
        playerPosition: playerPosition,
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
        var code = data.code;
        var roomNumber;
        var playerPosition;
        var exist = false;
        socket.join(data.code);


        for(var i in GAME_LIST){
            if(GAME_LIST[i] === code){
                roomNumber = i;
                playerPosition = PLAYER_LIST[i].length;
                exist = true;
                console.log("Connected to Game: " + code + " room number: " + roomNumber + " player position: " + playerPosition);
                break;
            }
        }
        if(!exist){
            GAME_LIST[gameRoomsCount] = code;
            roomNumber = gameRoomsCount;
            playerPosition = 0;
            gameRoomsCount = gameRoomsCount + 1;
            console.log("Created New Game: " + code + " room number: " + roomNumber + " player position: " + playerPosition);
        }

        socket.on('startGame', function(){
            console.log('connected to room: ' + code);
            //assign the socket id a random number and add the socket to a socket list
            socket.id = Math.random();


            var player;


            socket.on('playerName', function(data){
                PLAYER_NAME[socket.id] = data.name;
            });

            //create player and add it to the player list
            socket.on('createPlayer', function(){
                SOCKET_LIST.push(roomNumber);
                SOCKET_LIST[roomNumber].push(socket.id);
                SOCKET_LIST[roomNumber][socket.id] = socket;
                console.log(SOCKET_LIST);
                SOCKET_IDS.push(roomNumber);
                SOCKET_IDS[roomNumber].push(playerPosition);
                SOCKET_IDS[roomNumber][playerPosition] = socket.id;
                console.log(SOCKET_IDS);
                player = Player(socket.id, PLAYER_NAME[socket.id], code, "Host",playerPosition);
                PLAYER_LIST.push(roomNumber);
                PLAYER_LIST[roomNumber].push(socket.id);
                PLAYER_LIST[roomNumber][socket.id] = player;
                console.log(PLAYER_LIST);
            });

            socket.on('connectPlayer', function(){
                SOCKET_LIST[roomNumber].push(socket.id);
                SOCKET_LIST[roomNumber][socket.id] = socket;
                SOCKET_IDS[roomNumber].push(playerPosition);
                SOCKET_IDS[roomNumber][playerPosition] = socket.id;
                player = Player(socket.id, PLAYER_NAME[socket.id], code, "Guest",playerPosition);
                PLAYER_LIST[roomNumber].push(socket.id);
                PLAYER_LIST[roomNumber][socket.id] = player;
            });



            //if player disconnects, remove player from socket and player list
            socket.on('disconnect',function(){
                delete SOCKET_LIST[roomNumber][socket.id];
                delete PLAYER_LIST[roomNumber][socket.id];
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
    var pack = [[],[],[],[],[]];
    var socket_id;
    for(var i = 0, len = PLAYER_LIST.length; i < len; i++){
        for(var j = 0, len2 = PLAYER_LIST[i].length; j < len2; j++) {
            socket_id = SOCKET_IDS[i][j];
            var player = PLAYER_LIST[i][socket_id];
            player.updatePosition();
            pack[i].push({
                x: player.x,
                y: player.y,
                name: player.name,
                code: player.gameCode,
                role: player.role
            });
        }
    }
    for(var i = 0, len = SOCKET_LIST.length; i < len; i++){
        for(var j = 0, len2 = SOCKET_LIST[i].length; j < len2; j++) {
            socket_id = SOCKET_IDS[i][j];
            var socket = SOCKET_LIST[i][socket_id];
            socket.emit(GAME_LIST[i]+'newPositions', pack[i]);
        }
    }
},1000/25);