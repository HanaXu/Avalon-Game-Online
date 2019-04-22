import socketIO from 'socket.io-client';
import util from 'util';

const firstNames = ["John", "Larry", "Barry", "Sean", "Harry", "Lisa", "Lindsey", "Jennifer", "Kathy", "Linda"];
const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Miller", "Wilson"];
var nameStart = Math.floor(Math.random() * firstNames.length);

let questHistory1;
let questHistory2;
let questHistory3;
let questHistory4;
let questHistory5;


//Trust Factor Object
// {@property} name:
// {@propery} value:
// As the Player Accepts Votes or Succeeds Quests Value will increment
// Value will decrement likewise for Reject or Failure of Quest
var playerCounters = {};

const PLAYERS_ON_QUEST = [
    //5 6 7 8 9 10 players
    [2, 3, 2, 3, 3],
    [2, 3, 4, 3, 4],
    [2, 3, 3, 4, 4],
    [3, 4, 4, 5, 5],
    [3, 3, 4, 5, 5],
    [3, 4, 4, 5, 5]
];

export class gameBot {
    constructor() {
        this.socketID = null;
        this.name = null;
        this.roomCode = null;
        this.role = null;
        this.team = 'undecided';
        this.character = 'undecided';
        this.leader = false;
        this.onQuest = false;
        this.questAction = 'undecided';
        this.action = 'undecided';
    };

    createBot(roomCode, port) {

        let bot = new gameBot();

        var playersToChoose;

        bot.roomCode = roomCode;

        bot.name = createBotName();

        var socket = createSocketConnection(port);

        bot.socketID = socket.id;
        //socket.emit("connection", socket);

        socket.emit("joinRoom", {
            roomCode: bot.roomCode,
            name: bot.name
        });

        bot.role = "Guest";

        if (bot.role === "Guest") {
            socket.emit("connectPlayer");
        }

        socket.on("updatePlayers", function (players) {
            //updatePlayers(players, name);
            //console.log("in Bot Class on updatePlayers: ");
            // console.log(players)
            // console.log(`my socket id is: ${socket.id}`)


            playersToChoose = players;
            for (let i in players) {
                console.log(`Players Name: ${players[i].name}`);
                playerCounters[i] = {
                    name: players[i].name,
                    value: 0
                };
                //
                console.log(`PlayersCounter Name: ${playerCounters[i].name} And Value: ${playerCounters[i].value}`);
                if (players[i].socketID === socket.id) {
                    //console.log(`my identity is: ${players[i].name}`)
                    //console.log(`my character is ${players[i].team}`)
                    bot.team = players[i].team;
                }
            }
            // for (let i in playerCounters) {
            //     console.log(`PlayerCounters: ${playerCounters[i].name}`);
            //     console.log(`PlayerCounters: ${playerCounters[i].value}`);
            // }


        });

        socket.on("gameReady", function () {
            console.log("Bot Ready for Game!");
        });

        // Function For Bot to Decide Whether it Will
        // Accept or Reject the Vote for Quest Teams
        socket.on("acceptOrRejectTeam", function (data) {
            if (data.bool === true) {
                for (let i in data.onQuest) {
                    console.log(`acceptOrRejectTeamBot Data On bot ${bot.name}: ${util.inspect(data.onQuest[i], true, null, true)}`);
                }

                let botDecision = botDecisionQuest(data.onQuest);
                socket.emit("questTeamDecision", {
                    name: bot.name,
                    decision: botDecision
                });
            }
        });

        // Function For Bot to Decide Whether it Will
        // Accept or Reject the Quest
        function botDecisionQuest(playersOnQuest) {
            var decision;

            if (bot.team === 'Evil') {
                decision = 'reject';
            } else if (bot.team === 'Good') {
                decision = 'accept';
            }

            return decision;
        }

        function botQuestVote() {
            var decision;

            if (bot.team === 'Evil') {
                decision = 'fail';
            } else if (bot.team === 'Good') {
                decision = 'succeed';
            }

            return decision;
        }

        function createBotName() {
            /**
             * Lets get the Name of the bot,
             * Completely Randomized
             * @property {"The Bot"} = Middle name to show client console that it is a bot
             * Will be removed later
             */
            var firstName = firstNames[(nameStart++) % (firstNames.length)];
            var lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            var middleName = " The Bot ";

            var name = firstName;
            name.concat(middleName);

            console.log("Name is :");
            console.log(name);

            return name;
        }

        function createSocketConnection(port) {
            /*
                Socket Connection Portion
            */
            var clientIO = socketIO;
            var socket = clientIO.connect(`http://localhost:${port}`);

            socket.on('connect', () => {
                console.log(`In gameBot Class: Socket ID: ${socket.id}`);
            });

            return socket;
        }

        socket.on('updateHistoryModal', function (data) {
            questHistory1 = data[1][1];
            questHistory2 = data[2][1];
            questHistory3 = data[3][1];
            questHistory4 = data[4][1];
            questHistory5 = data[5][1];
            //console.log(`Quest History 1 is: ${util.inspect(questHistory1, false, null, true)}`);
        });

        // Bot Chooses Players For Quest
        // Currently just dummy Version
        // Algorithm Can be applied later via Functions
        socket.on('choosePlayersForQuest', function (data) {
            console.log(`Leader Bot: ${bot.leader}, ${bot.name}`);
            bot.leader = true;
            console.log(`Leader Bot: ${bot.leader}, ${bot.name}`);
            if (bot.leader === true && data.bool === true) {
                if (bot.team === 'Evil') {
                    var currentQuestNum = data.currentQuestNum;
                    var players = data.players;

                    // console.log(`On Quest: ${currentQuestNum}`);
                    // console.log(`Players: ${players}`);
                    console.log(`number of players: ${players.length}`);
                    var playersOnQuestNum = PLAYERS_ON_QUEST[players.length - 5][currentQuestNum - 1];

                    for (var i = 0; i < playersOnQuestNum; i++) {
                        console.log(`Chose: ${players[i].name}`);
                        players[i].onQuest = true;
                        socket.emit("addPlayerToQuest", players[i].name);
                        socket.emit('updatePlayers')
                    }
                    bot.leader = false;
                    socket.emit('questTeamConfirmed');
                } else if (bot.team === 'Good') {
                    var currentQuestNum = data.currentQuestNum;
                    var players = data.players;

                    // console.log(`On Quest: ${currentQuestNum}`);
                    // console.log(`Players: ${players}`);
                    console.log(`number of players: ${players.length}`);
                    var playersOnQuestNum = PLAYERS_ON_QUEST[players.length - 5][currentQuestNum - 1];

                    for (var i = 0; i < playersOnQuestNum; i++) {
                        console.log(`Chose: ${players[i].name}`);
                        players[i].onQuest = true;
                        socket.emit("addPlayerToQuest", players[i].name);
                        socket.emit('updatePlayers')
                    }
                    bot.leader = false;
                    socket.emit('questTeamConfirmed');
                }

            }
        });


        // Succeeding or Failing Quests
        socket.on('goOnQuest', function () {
            let botDecision = botQuestVote();
            socket.emit("questVote", {
                name: bot.name,
                decision: botDecision
            });
        });



        // Bot Attempt at Assassination
        // Again Currently just making a choice at Random
        socket.on('beginAssassination', function (msg) {
            let assassinArr = playersToChoose;
            console.log(`AssassinArr: ${assassinArr}`);

            for (let i = 0; i < assassinArr.length; i++) {
                console.log(`My Name is: ${assassinArr[i].name} and Team is: ${assassinArr[i].team}`);
                if (assassinArr[i].team === 'Evil') {
                    assassinArr.splice(i, 1);
                    i--;
                }
            }
            console.log(`After Slice AssassinArr: ${assassinArr}`);
            console.log(`My Name is: ${bot.name} And I got this from Server: ${msg}`);
            var toAssassinate = Math.floor(Math.random() * assassinArr.length);
            console.log(`AssassinArr.lenth: ${assassinArr.length()}`);
            console.log(`toAssassinate: ${toAssassinate}`);
            console.log(`Players To Assassinate: ${assassinArr[toAssassinate].name}`);

            socket.emit('assassinatePlayer', assassinArr[toAssassinate].name);
        });
    }



};