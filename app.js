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

//create two arrays for sockets and players 
var SOCKET_LIST = {}; 
var PLAYER_LIST = {};


//create player attributes. x and y position, id and a number between 0 and 9
var Player = function(id){
	var self = {
		x:250,
		y:250,
		id:id,
		number:"" + Math.floor(10 * Math.random()),
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
	//assign the socket id a random number and add the socket to a socket list
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	
	//create player and add it to the player list
	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;
	
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

setInterval(function(){
	var pack = [];
	for(var i in PLAYER_LIST){
		var player = PLAYER_LIST[i];
		player.updatePosition();
		pack.push({
			x:player.x,
			y:player.y,
			number:player.number
		});
	}
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i]
		socket.emit('newPositions',pack);
	}
	
},1000/25);