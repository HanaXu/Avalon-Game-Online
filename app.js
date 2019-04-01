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
const SOCKET_LIST = [[],[],[],[],[]]; //[room index: 0,1,2..] [socket.id] = socket
const PLAYER_LIST = [[],[],[],[],[]]; //[room index: 0,1,2..] [socket.id] = player
const SOCKET_IDS = [[],[],[],[],[]]; //[room index: 0,1,2..] [player index: 0,1,2..]
const GAME_GATE = {};
const GAME_STAGE = {};
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
    var shuffledIdentities;
    //iterate over a list of player objects
    if (numberOfPlayers ===5){
        shuffledIdentities = shuffle(FIVE_PLAYERS_IDENTITIES);
    }
    else if (numberOfPlayers ===6){
        shuffledIdentities = shuffle(SIX_PLAYERS_IDENTITIES);
    }
    else if (numberOfPlayers === 7){
        shuffledIdentities = shuffle(SEVEN_PLAYERS_IDENTITIES);
    }
    else if (numberOfPlayers === 8){
        shuffledIdentities = shuffle(EIGHT_PLAYERS_IDENTITIES);
    }
    else if (numberOfPlayers === 9){
        shuffledIdentities = shuffle(NINE_PLAYERS_IDENTITIES);
    }
    else if (numberOfPlayers === 10){
        shuffledIdentities = shuffle(TEN_PLAYERS_IDENTITIES);
    }

    //x = index of shuffledIdentities array
    var x = 0;
    //i = index of PLAYER_LIST array, which may have null values if players disconnected
    for(var i = 0; i < PLAYER_LIST[roomNumber].length; i++){
        //make sure that this player has not disconnected (is not null)
        if(PLAYER_LIST[roomNumber][socket_id[i]] != null){
            PLAYER_LIST[roomNumber][socket_id[i]].character = shuffledIdentities[x];
            if(shuffledIdentities[x] === "Merlin" || shuffledIdentities[x] === "Loyal Servant of Arthur"){
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Good";
            }else{
                PLAYER_LIST[roomNumber][socket_id[i]].team = "Evil";
            }
            x++;
        }
    }
}

function assignLeader(roomNumber, socket_id){
    var randomNumber = Math.floor(Math.random() * Math.floor(PLAYER_LIST[roomNumber].length));
    for(var i = 0; i < PLAYER_LIST[roomNumber].length; i++){
        if(PLAYER_LIST[roomNumber][socket_id[randomNumber]] != null){
            PLAYER_LIST[roomNumber][socket_id[randomNumber]].leader = true;
            break;
        }
    }
    GAME_STAGE[roomNumber] = 2;
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
        leader: false,
        quest_action: "undecided",
        quest_approval: "undecided",
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
            GAME_STAGE[gameRoomsCount] = 0;
            GAME_GATE[gameRoomsCount] = 1;
            GAME_LIST[gameRoomsCount] = code;
            roomNumber = gameRoomsCount;
            playerPosition = 0;
            gameRoomsCount = gameRoomsCount + 1;
            console.log("Created New Game: " + code + " room number: " + roomNumber + " player position: " + playerPosition);
        }


        //if room is open create and connect player to game
        if(GAME_GATE[roomNumber] === 1){
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
                    console.log("Room " + roomNumber + " SocketList: " + SOCKET_LIST[roomNumber] + ". PlayerList: "
                        + PLAYER_LIST[roomNumber] + ". Socket Ids: " + SOCKET_IDS[roomNumber] + ". PlayerPosition: " + playerPosition);
                });

                socket.on('connectPlayer', function(){
                    SOCKET_LIST[roomNumber].push(socket.id);
                    SOCKET_LIST[roomNumber][socket.id] = socket;
                    SOCKET_IDS[roomNumber].push(playerPosition);
                    SOCKET_IDS[roomNumber][playerPosition] = socket.id;
                    player = Player(socket.id, PLAYER_NAME[socket.id], code, "Guest",playerPosition);
                    PLAYER_LIST[roomNumber].push(socket.id);
                    PLAYER_LIST[roomNumber][socket.id] = player;
                    console.log("Room " + roomNumber + " SocketList: " + SOCKET_LIST[roomNumber] + ". PlayerList: "
                        + PLAYER_LIST[roomNumber] + ". Socket Ids: " + SOCKET_IDS[roomNumber] + ". PlayerPosition: " + playerPosition);
                });

                socket.on('startGameRoom',function(){
                    GAME_GATE[roomNumber] = 0;
                    GAME_STAGE[roomNumber] = 1;
                });


                //if player disconnects, remove player stuff in array
                socket.on('disconnect',function(){
                    if(PLAYER_LIST[roomNumber][SOCKET_IDS[roomNumber][playerPosition]].role === "Host"){
                        delete SOCKET_LIST[roomNumber][playerPosition];
                        delete PLAYER_LIST[roomNumber][playerPosition];
                        delete SOCKET_IDS[roomNumber][playerPosition];
                        if(PLAYER_LIST[roomNumber].length > 0){
                            for(let j = 0, len2 = PLAYER_LIST[roomNumber].length; j < len2; j++){
                                if(SOCKET_IDS[roomNumber][j] != null){
                                    PLAYER_LIST[roomNumber][SOCKET_IDS[roomNumber][j]].role = "Host";
                                    break;
                                }
                            }
                        }
                        socket.emit(GAME_LIST[roomNumber]+'setUpTable', PLAYER_LIST[roomNumber]);
                        console.log("Room " + roomNumber + " SocketList: " + SOCKET_LIST[roomNumber] + ". PlayerList: "
                            + PLAYER_LIST[roomNumber] + ". Socket Ids: " + SOCKET_IDS[roomNumber] + ". PlayerPosition: " + playerPosition);
                    }else{
                        delete SOCKET_LIST[roomNumber][playerPosition];
                        delete PLAYER_LIST[roomNumber][playerPosition];
                        delete SOCKET_IDS[roomNumber][playerPosition];
                        socket.emit(GAME_LIST[roomNumber]+'setUpTable', PLAYER_LIST[roomNumber]);
                        console.log("Room " + roomNumber + " SocketList: " + SOCKET_LIST[roomNumber] + ". PlayerList: "
                            + PLAYER_LIST[roomNumber] + ". Socket Ids: " + SOCKET_IDS[roomNumber] + ". PlayerPosition: " + playerPosition);

                    }
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
            if(socket_id != null) {
                let player = PLAYER_LIST[i][socket_id];
                pack[i].push({
                    id: player.id,
                    name: player.name,
                    code: player.gameCode,
                    role: player.role,
                    turn: player.turn,
                    team: player.team,
                    character: player.character,
                    leader: player.leader,
                    quest_action: player.quest_action,
                    quest_approval: player.quest_approval,
                    action: player.action
                });
            }
        }
    }

    for(let i = 0, len = SOCKET_LIST.length; i < len; i++) {
        //GAME_STAGE 0 is users connecting
        if (GAME_STAGE[i] === 0) {
            for (let j = 0, len2 = SOCKET_LIST[i].length; j < len2; j++) {
                if (GAME_GATE[i] === 1) {
                    socket_id = SOCKET_IDS[i][j];
                    if (socket_id != null) {
                        let socket = SOCKET_LIST[i][socket_id];
                        socket.emit(GAME_LIST[i] + 'setUpTable', pack[i]);
                        if (pack[i].length >= 5 && GAME_GATE[i] === 1) {
                            for (let k = 0, len2 = SOCKET_IDS[i].length; k < len2; k++) {
                                if (PLAYER_LIST[i][SOCKET_IDS[i][j]].role === "Host") {
                                    SOCKET_LIST[i][SOCKET_IDS[i][j]].emit(GAME_LIST[i] + 'gameReady');
                                }
                            }
                        }
                    }
                }
            }
        // GAME_STAGE 1 = after host clicks start, assign identities & select first leader (in server)
        }else if (GAME_STAGE[i] === 1) {
            assignIdentities(pack[i].length, i, SOCKET_IDS[i]);
            assignLeader(i, SOCKET_IDS[i]);
        //GAME_STAGE 2 = update client with identity info (all in client)
        }else if (GAME_STAGE[i] === 2) {
            for (let j = 0, len2 = SOCKET_LIST[i].length; j < len2; j++) {
                socket_id = SOCKET_IDS[i][j];
                if (socket_id != null) {
                    let socket = SOCKET_LIST[i][socket_id];
                    socket.emit(GAME_LIST[i] + 'assignIdentities', pack[i]);
                }
            }
            GAME_STAGE[i] = 3;
        //GAME_STAGE 3 = game loop; loops through all 5 quests
        }else if (GAME_STAGE[i] === 3){
        //GAME_STAGE 4 = end of game; display winner and what not
        }else if (GAME_STAGE[i] === 4){

        }
    }



},1000/25);