import socketIO from 'socket.io-client';

//const name = "John The Bot";
const firstNames = ["John", "Larry", "Barry", "Sean", "Harry", "Lisa", "Lindsey", "Jennifer", "Kathy", "Linda"];
const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Miller", "Wilson"];

export class gameBot {
    constructor() {
        this.socketID = null;
        this.name = null;
        this.roomCode = null;
        this.role = null;
        this.turn = false;
        this.team = null;
        this.character = null;
        this.leader = false;
        this.questAction = null;
        this.action = null;
    };

    createBot(roomCode) {

        let bot = new gameBot();

        bot.roomCode = roomCode;

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
        name.concat(middleName);
        bot.name = name;
        console.log("Name is :");
        console.log(bot.name);

        /*
            Socket Connection Portion
        */
        var clientIO = socketIO;
        var socket = clientIO.connect('http://localhost:3000');

        socket.on('connect', () => {
            bot.socketID = socket.id;
            console.log(`In gameBot Class: Socket ID: ${bot.socketID}`);
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

        socket.on("updatePlayers", function (players) {
            //updatePlayers(players, name);
            console.log("in Bot Class on updatePlayers: ");
            // console.log(players)
            // console.log(`my socket id is: ${socket.id}`)

            for (let i in players) {
                if (players[i].socketID === socket.id) {
                    console.log(`my identity is: ${players[i].name}`)
                    console.log(`my character is ${players[i].team}`)
                    bot.team = players[i].team;
                }
            }
        });

        socket.on("gameReady", function () {
            console.log("Bot Ready for Game!");
        });

        socket.on("acceptOrRejectTeam", function () {
            let botDecision = botDecisionQuest();
            socket.emit("questTeamDecision", {
                name: bot.name,
                decision: botDecision
            });

        });

        function botDecisionQuest() {
            var decision;

            if (bot.team === 'Evil') {
                decision = 'reject';
            } else {
                decision = 'accept';
            }

            return decision;
        }
    }

};