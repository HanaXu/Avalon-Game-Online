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

const SOCKET_LIST = [[],[],[],[],[]]; //Contains all sockets of clients
const PLAYER_LIST = [[],[],[],[],[]]; //Contains all player objects
const PLAYER_COUNT = {}; //Keeps record of player count in each game
const GAME_GATE = {}; //value of 0 or 1 for each game. if 1 room is open, if 0 room is closed
const GAME_STAGE = {}; //keeps record of game stage in each room
const GAME_LIST = {}; //keeps record of all game codes
const PLAYER_NAME = {}; //used to set player name, but can be done without it
let gameRoomsCount = 0; //keeps record of how many game rooms there are


//constants used in assignIdentites function depending on how many players are connected when game is started
const FIVE_PLAYERS_IDENTITIES = ["Merlin", "Assassin" ,"Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred"];
const SIX_PLAYERS_IDENTITIES = ["Merlin", "Assassin", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred"];
const SEVEN_PLAYERS_IDENTITIES = ["Merlin", "Assassin", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred", "Minion of Mordred"];
const EIGHT_PLAYERS_IDENTITIES = ["Merlin", "Assassin", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred", "Minion of Mordred"];
const NINE_PLAYERS_IDENTITIES = ["Merlin", "Assassin", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred", "Minion of Mordred"];
const TEN_PLAYERS_IDENTITIES = ["Merlin", "Assassin", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Loyal Servant of Arthur", "Minion of Mordred", "Minion of Mordred", "Minion of Mordred"];

let quest1, quest2, quest3, quest4, quest5;

let quests = [quest1, quest2, quest3, quest4, quest5];


//assigns each player an identity in the game
function assignIdentities(numberOfPlayers, roomNumber) {
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
    //I did not assign any players their identities yet, not sure how the players are being passed
    var x = 0;
    //loops through the player list, if it is not null assign an identity from the shuffled Identities
    for(var i = 0; i < PLAYER_LIST[roomNumber].length; i++){
        if(PLAYER_LIST[roomNumber][i] != null){
            PLAYER_LIST[roomNumber][i].character = shuffledIdentities[x];
            //if the identity merlin or loyal servant of arthur set team to good, else to evil
            if(shuffledIdentities[x] === "Merlin" || shuffledIdentities[x] === "Loyal Servant of Arthur"){
                PLAYER_LIST[roomNumber][i].team = "Good";
            }else{
                PLAYER_LIST[roomNumber][i].team = "Evil";
            }
            x++;
        }
    }
}

//randomly assign a room leader in the player list.
function assignLeader(roomNumber){
    var randomNumber = Math.floor(Math.random() * Math.floor(PLAYER_LIST[roomNumber].length));
    for(var i = 0; i < PLAYER_LIST[roomNumber].length; i++){
        if(PLAYER_LIST[roomNumber][i] != null){
            PLAYER_LIST[roomNumber][i].leader = true;
            break;
        }
    }
    GAME_STAGE[roomNumber] = 2;
}

//shuffle the array
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

//Player object and its attributes
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
                PLAYER_COUNT[roomNumber] = PLAYER_COUNT[roomNumber] + 1;
                playerPosition = PLAYER_LIST[i].length;
                exist = true;
                console.log("Connected to Game: " + code + " room number: " + roomNumber + " player position: " + playerPosition);
                break;
            }
        }

        //if game does not exist add game stuff
        if(!exist){
            PLAYER_COUNT[gameRoomsCount] = 0;
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
                var player;

                socket.on('playerName', function(data){
                    PLAYER_NAME[PLAYER_COUNT[roomNumber]] = data.name;
                });

                //create player and add it to the player list
                socket.on('createPlayer', function(){
                    SOCKET_LIST.push(roomNumber);
                    SOCKET_LIST[roomNumber].push(PLAYER_COUNT[roomNumber]);
                    SOCKET_LIST[roomNumber][PLAYER_COUNT[roomNumber]] = socket;
                    console.log(SOCKET_LIST);
                    player = Player(socket.id, PLAYER_NAME[PLAYER_COUNT[roomNumber]], code, "Host",playerPosition);
                    PLAYER_LIST.push(roomNumber);
                    PLAYER_LIST[roomNumber].push(PLAYER_COUNT[roomNumber]);
                    PLAYER_LIST[roomNumber][PLAYER_COUNT[roomNumber]] = player;
                    console.log(PLAYER_LIST);
                    console.log("Room " + roomNumber + " SocketList: " + SOCKET_LIST[roomNumber] + ". PlayerList: "
                        + PLAYER_LIST[roomNumber] + ". Socket Ids: " + ". PlayerPosition: " + playerPosition);
                });

                socket.on('connectPlayer', function(){
                    SOCKET_LIST[roomNumber].push(PLAYER_COUNT[roomNumber]);
                    SOCKET_LIST[roomNumber][PLAYER_COUNT[roomNumber]] = socket;
                    player = Player(socket.id, PLAYER_NAME[PLAYER_COUNT[roomNumber]], code, "Guest",playerPosition);
                    PLAYER_LIST[roomNumber].push(PLAYER_COUNT[roomNumber]);
                    PLAYER_LIST[roomNumber][PLAYER_COUNT[roomNumber]] = player;
                    console.log("Room " + roomNumber + " SocketList: " + SOCKET_LIST[roomNumber] + ". PlayerList: "
                        + PLAYER_LIST[roomNumber] + ". Socket Ids: " + ". PlayerPosition: " + playerPosition);
                });

                socket.on('startGameRoom',function(){
                    GAME_GATE[roomNumber] = 0;
                    GAME_STAGE[roomNumber] = 1;
                });


                //if player disconnects, remove player stuff in array
                socket.on('disconnect',function(){
                    if(PLAYER_LIST[roomNumber][playerPosition].role === "Host"){
                        delete SOCKET_LIST[roomNumber][playerPosition];
                        delete PLAYER_LIST[roomNumber][playerPosition];
                        if(PLAYER_LIST[roomNumber].length > 0){
                            for(let j = 0, len2 = PLAYER_LIST[roomNumber].length; j < len2; j++){
                                if(PLAYER_LIST[roomNumber][j] != null){
                                    PLAYER_LIST[roomNumber][j].role = "Host";
                                    break;
                                }
                            }
                        }
                        socket.emit(GAME_LIST[roomNumber]+'setUpTable', PLAYER_LIST[roomNumber]);
                        console.log("Room " + roomNumber + " SocketList: " + SOCKET_LIST[roomNumber] + ". PlayerList: "
                            + PLAYER_LIST[roomNumber] + ". PlayerPosition: " + playerPosition);
                    }else{
                        delete SOCKET_LIST[roomNumber][playerPosition];
                        delete PLAYER_LIST[roomNumber][playerPosition];
                        socket.emit(GAME_LIST[roomNumber]+'setUpTable', PLAYER_LIST[roomNumber]);
                        console.log("Room " + roomNumber + " SocketList: " + SOCKET_LIST[roomNumber] + ". PlayerList: "
                            + PLAYER_LIST[roomNumber] + ". PlayerPosition: " + playerPosition);

                    }
                });
            });
        }
    });
});

setInterval(function(){
    const pack = [[],[],[],[],[]];
    //loop through all the players in the server
    for(let i = 0, len = PLAYER_LIST.length; i < len; i++){
        //loop through all the players in a specific room
        for(let j = 0, len2 = PLAYER_LIST[i].length; j < len2; j++){
            //if player does not exist, move on to next. if they do exist, update their attributes by pushing it to pack
            if(PLAYER_LIST[i][j] != null) {
                let player = PLAYER_LIST[i][j];
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

    //loop through all the sockets in the server
    for(let i = 0, len = SOCKET_LIST.length; i < len; i++) {
        if (GAME_STAGE[i] === 0) {
            //loop through sockets in a specific room
            for (let j = 0, len2 = SOCKET_LIST[i].length; j < len2; j++) {
                if (GAME_GATE[i] === 1) {
                    //if socket does not exist move on to the next one
                    if (SOCKET_LIST[i][j] != null) {
                        let socket = SOCKET_LIST[i][j];
                        //send that socket the pack[i] which has all the players in that room so it sets up the table
                        socket.emit(GAME_LIST[i] + 'setUpTable', pack[i]);
                        if (pack[i].length >= 5 && GAME_GATE[i] === 1) {
                            for (let k = 0, len2 = PLAYER_LIST[i].length; k < len2; k++) {
                                if (PLAYER_LIST[i][j].role === "Host") {
                                    SOCKET_LIST[i][j].emit(GAME_LIST[i] + 'gameReady');
                                }
                            }
                        }
                    }
                }
            }
        }else if (GAME_STAGE[i] === 1) {
            //assign identities and leader
            assignIdentities(pack[i].length, i);
            assignLeader(i);
        }else if (GAME_STAGE[i] === 2) {
            //loop through all the sockets in a specific room and give all of them the pack[i] which as all player objects
            for (let j = 0, len2 = SOCKET_LIST[i].length; j < len2; j++) {
                if (SOCKET_LIST[i][j] != null) {
                    let socket = SOCKET_LIST[i][j];
                    //emit pack as assignIdentities to client
                    socket.emit(GAME_LIST[i] + 'assignIdentities', pack[i]);
                }
            }
            GAME_STAGE[i] = 3;
        }else if (GAME_STAGE[i] === 3){
        }else if (GAME_STAGE[i] === 4){
        }
    }



},1000/25);