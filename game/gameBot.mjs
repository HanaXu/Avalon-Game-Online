import socketIO from 'socket.io-client';

//const name = "John The Bot";
const firstNames = ["John", "Larry", "Barry", "Sean", "Harry", "Lisa", "Lindsey", "Jennifer", "Kathy", "Linda"];
const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Miller", "Wilson"];

export class gameBot {
    constructor() {
        //this.socketID = socketID;
        this.name = "";
        this.roomCode = roomCode;
        this.role = role;
        this.turn = false;
        this.team = 'undecided';
        this.character = 'undecided';
        this.leader = false;
        this.questAction = 'undecided';
        this.action = 'undecided';
    };

    static createBot(roomCode) {
        this.roomCode = roomCode;

        /**
         * Lets get the Name of the bot,
         * Completely Randomized
         * @property {"The Bot"} = Middle name to show client console that it is a bot
         * Will be removed later
         */
        var firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        var lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        var middleName = " The Bot ";
        var name = firstName;
        name = name.concat(middleName);
        console.log("Name is :");
        console.log(name);
        var clientIO = socketIO;
        var socket = clientIO.connect('http://localhost:3000');

        socket.on('connect', () => {
            console.log("In gameBot Class: Socket ID:");
            console.log(socket.id)
        });
        //socket.emit("connection", socket);

        socket.emit("joinRoom", {
            roomCode: roomCode,
            name: name
        });

        this.role = "Guest";

        if (this.role === "Guest") {
            socket.emit("connectPlayer");
        }

        socket.on("assignIdentities", function (players) {
            //gameScreen.assignIdentities = true;
            //updatePlayers(players, name);
            //console.log("Players Object");
            //console.log(players);
            let i = 0;
            for (i in players) {
                if (players[i].socketID === socket.id) {
                    //console.log("found my Socket ID: "+name);
                    console.log("My Identity is: " + players[i].name + " " + players[i].character);
                }
            }
        });

        socket.on("gameReady", function () {
            console.log("Bot Ready for Game!");
        });

        socket.on("SetUpTable", function (players) {
            let i = 0;
            for (i in players) {
                if (players[i].socketID === socket.id) {
                    console.log("found my Socket ID: "+name);
                }

            }
            //gameScreen.showGameScreen = true;
            //updatePlayers(players);
        });
    }

};
