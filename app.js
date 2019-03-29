console.log('Hello world');

//File comunication with express
let express = require('express');
let app = express();
let serv = require('http').Server(app);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

//create three arrays for sockets, game code and players
const SOCKET_LIST = [[],[],[],[],[]]; //[room index: 0,1,2..] [socket.id]
const PLAYER_LIST = [[],[],[],[],[]]; //[room index: 0,1,2..] [socket.id]
const SOCKET_IDS = [[],[],[],[],[]]; //[room index: 0,1,2..] [player index: 0,1,2..]
const GAME_GATE = {};
const Assign_Identities = {};
const GAME_LIST = {}; // [room index] = the room code
const PLAYER_NAME = {};
let gameRoomsCount = 0;


const FIVE_PLAYERS_IDENTITIES = ["Merlin", "Assassin" ,"Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred"];
const SIX_PLAYERS_IDENTITIES = ["Merlin", "Assassin", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred"];
const SEVEN_PLAYERS_IDENTITIES = ["Merlin", "Assassin", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred", "Minion of Mordred"];
const EIGHT_PLAYERS_IDENTITIES = ["Merlin", "Assassin", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred", "Minion of Mordred"];
const NINE_PLAYERS_IDENTITIES = ["Merlin", "Assassin", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred", "Minion of Mordred"];
const TEN_PLAYERS_IDENTITIES = ["Merlin", "Assassin", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred", "Minion of Mordred", "Minion of Mordred"];

let quest1, quest2, quest3, quest4, quest5;

let quests = [quest1, quest2, quest3, quest4, quest5];


//takes 3 param and sets players roles based on their length.
function assignIdentities(numberOfPlayers, roomNumber, socket_id) {
    console.log("assignIdentities()");
    //iterate over a list of player objects
    if (numberOfPlayers ===5){
        var shuffledIdentities = shuffle(FIVE_PLAYERS_IDENTITIES);
        for(var i = 0; i < PLAYER_LIST[roomNumber].length; i++){
            PLAYER_LIST[roomNumber][socket_id[i]].character = shuffledIdentities[i];
            if(shuffledIdentities[i] === "Merlin" || shuffledIdentities[i] === "Loyal Servant of Arthur"){
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Good";
            }else{
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Evil";
            }
        }
    }
    else if (numberOfPlayers ===6){
        shuffledIdentities = shuffle(SIX_PLAYERS_IDENTITIES);
        for(var i = 0; i < PLAYER_LIST[roomNumber].length; i++){
            PLAYER_LIST[roomNumber][socket_id[i]].character = shuffledIdentities[i];
            if(shuffledIdentities[i] === "Merlin" || shuffledIdentities[i] === "Loyal Servant of Arthur"){
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Good";
            }else{
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Evil";
            }
        }
    }
    else if (numberOfPlayers === 7){
        shuffledIdentities = shuffle(SEVEN_PLAYERS_IDENTITIES);
        for(var i = 0; i < PLAYER_LIST[roomNumber].length; i++){
            PLAYER_LIST[roomNumber][socket_id[i]].character = shuffledIdentities[i];
            if(shuffledIdentities[i] === "Merlin" || shuffledIdentities[i] === "Loyal Servant of Arthur"){
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Good";
            }else{
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Evil";
            }
        }
    }
    else if (numberOfPlayers === 8){
        shuffledIdentities = shuffle(EIGHT_PLAYERS_IDENTITIES);
        for(var i = 0; i < PLAYER_LIST[roomNumber].length; i++){
            PLAYER_LIST[roomNumber][socket_id[i]].character = shuffledIdentities[i];
            if(shuffledIdentities[i] === "Merlin" || shuffledIdentities[i] === "Loyal Servant of Arthur"){
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Good";
            }else{
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Evil";
            }
        }
    }
    else if (numberOfPlayers === 9){
        shuffledIdentities = shuffle(NINE_PLAYERS_IDENTITIES);
        for(var i = 0; i < PLAYER_LIST[roomNumber].length; i++){
            PLAYER_LIST[roomNumber][socket_id[i]].character = shuffledIdentities[i];
            if(shuffledIdentities[i] === "Merlin" || shuffledIdentities[i] === "Loyal Servant of Arthur"){
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Good";
            }else{
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Evil";
            }
        }
    }
    else if (numberOfPlayers === 10){
        shuffledIdentities = shuffle(TEN_PLAYERS_IDENTITIES);
        for(var i = 0; i < PLAYER_LIST[roomNumber].length; i++){
            PLAYER_LIST[roomNumber][socket_id[i]].character = shuffledIdentities[i];
            if(shuffledIdentities[i] === "Merlin" || shuffledIdentities[i] === "Loyal Servant of Arthur"){
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Good";
            }else{
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Evil";
            }
        }
    }
    //I did not assign any players their identities yet, not sure how the players are being passed
    Assign_Identities[roomNumber] = 2;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

//create player and their attributes
const Player = function(id, name, gameCode, role, playerPosition){
    return {
        id: id,
        name: name,
        gameCode: gameCode,
        role: role,
        playerPosition: playerPosition,
        turn: false,
        team: "undecided",
        character: "undecided",
        action: "undecided"
    };
}




const io = require('socket.io')(serv,{});

//start connection
io.sockets.on('connection', function(socket){
    //start room connection
    socket.on('roomCode', function(data){
        const code = data.code;
        let roomNumber;
        let playerPosition;
        let exist = false;
        socket.join(data.code);

        //go through game list and if it exists or open connect the player to a game
        for(let i in GAME_LIST){
            if(GAME_LIST[i] === code && GAME_GATE[gameRoomsCount-1] === 1){
                roomNumber = i;
                playerPosition = PLAYER_LIST[i].length;
                exist = true;
                console.log("Connected to Game: " + code + " room number: " + roomNumber + " player position: " + playerPosition);
                break;
            }
        }

        //if game does not exist add game stuff
        if(!exist){
            Assign_Identities[gameRoomsCount] = 0;
            GAME_GATE[gameRoomsCount] = 1;
            GAME_LIST[gameRoomsCount] = code;
            roomNumber = gameRoomsCount;
            playerPosition = 0;
            gameRoomsCount = gameRoomsCount + 1;
            console.log("Created New Game: " + code + " room number: " + roomNumber + " player position: " + playerPosition);
        }


        //if room is open create and connect player to game
        if(GAME_GATE[gameRoomsCount-1] === 1){
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

                socket.on('startGameRoom',function(){
                    GAME_GATE[roomNumber] = 0;
                    Assign_Identities[roomNumber] = 1;
                });


                //if player disconnects, remove player stuff in array
                socket.on('disconnect',function(){
                    delete SOCKET_LIST[roomNumber][socket.id];
                    delete PLAYER_LIST[roomNumber][socket.id];
                    delete PLAYER_NAME[socket.id];
                    delete SOCKET_IDS[roomNumber][playerPosition];
                    socket.emit(GAME_LIST[roomNumber]+'setUpTable', PLAYER_LIST[roomNumber]);
                });
            });
        }
    });
});

setInterval(function(){
    const pack = [[],[],[],[],[]];
    let socket_id;
    for(let i = 0, len = PLAYER_LIST.length; i < len; i++){
        for(let j = 0, len2 = PLAYER_LIST[i].length; j < len2; j++) {
            socket_id = SOCKET_IDS[i][j];
            if(socket_id !== null) {
                let player = PLAYER_LIST[i][socket_id];
                pack[i].push({
                    id: player.id,
                    name: player.name,
                    code: player.gameCode,
                    role: player.role,
                    turn: player.turn,
                    team: player.team,
                    character: player.character,
                    action: player.action
                });
            }
        }
    }
    for(let i = 0, len = SOCKET_LIST.length; i < len; i++){
        for(let j = 0, len2 = SOCKET_LIST[i].length; j < len2; j++) {
            if(GAME_GATE[i] === 1){
                socket_id = SOCKET_IDS[i][j];
                if(socket_id !== null){
                    let socket = SOCKET_LIST[i][socket_id];
                    socket.emit(GAME_LIST[i]+'setUpTable', pack[i]);
                    if(pack[i].length >= 5 && GAME_GATE[i] === 1){
                        SOCKET_LIST[i][SOCKET_IDS[i][0]].emit(GAME_LIST[i]+'gameReady');
                    }
                }
            }else if(Assign_Identities[i] === 1){
                assignIdentities(pack[i].length, i, SOCKET_IDS[i]);
            }else if (Assign_Identities[i] === 2) {
                for (let j = 0, len2 = SOCKET_LIST[i].length; j < len2; j++) {
                    socket_id = SOCKET_IDS[i][j];
                    if (socket_id !== null) {
                        let socket = SOCKET_LIST[i][socket_id];
                        socket.emit(GAME_LIST[i]+'assignIdentities', pack[i]);
                    }
                }
            }
        }
    }

},1000/25);