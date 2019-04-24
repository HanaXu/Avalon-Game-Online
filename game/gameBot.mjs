import socketIO from 'socket.io-client';
import util from 'util';
import { QuestHistory } from './history.mjs';

const firstNames = ["John", "Larry", "Barry", "Sean", "Harry", "Lisa", "Lindsey", "Jennifer", "Kathy", "Linda"];
const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Miller", "Wilson"];
var nameStart = Math.floor(Math.random() * firstNames.length);

/*//Trust Factor Object
// {@property} name:
// {@propery} value:
// As the Player Accepts Votes or Succeeds Quests Value will increment
// Value will decrement likewise for Reject or Failure of Quest
var playerCounters = {};

// The Following Arrays are for the Adding and Not adding of Clients to Quest Teams
var definitelyAdd = [];
var possibleAdd = [];
var doNotAdd = [];*/

const PLAYERS_ON_QUEST = [
    //5 6 7 8 9 10 players
    [2, 3, 2, 3, 3],
    [2, 3, 4, 3, 4],
    [2, 3, 3, 4, 4],
    [3, 4, 4, 5, 5],
    [3, 4, 4, 5, 5],
    [3, 4, 4, 5, 5]
];

export class GameBot {
    constructor() {
        this.socketID = null;
        this.socket = null;
        this.name = null;
        this.roomCode = null;
        this.role = null;
        this.team = 'undecided';
        this.character = 'undecided';
        this.leader = false;
        this.onQuest = false;
        this.questAction = 'undecided';
        this.action = 'undecided';
        this.lastQuest = 1;
        this.lastVoteTrack = 1; // lastQuest and lastVoteTrack keep track of most recent quest history entry

        //this.gameObject = null; //a current copy of the game object
        this.players = []; //a list of all player objects (sanitized)
        this.playerRiskScores = []; //player name, identityKnown boolean, and riskScore
    };

    //everything socket related goes here
    //INSIDE THIS FUNCTION createbot(), REFERENCE TO THE BOT OBJECT IS ALWAYS USING bot.(variablename), ex bot.name
    createBot(roomCode, port) {
        let bot = new GameBot();
        bot.roomCode = roomCode;
        bot.name = GameBot.createBotName();
        bot.socket = bot.createSocketConnection(port);
        bot.socketID = bot.socket.id;
        //socket.emit("connection", socket);



        bot.socket.emit("joinRoom", {
            roomCode: bot.roomCode,
            name: bot.name
        });

        bot.role = "Guest";

        if (bot.role === "Guest") {
            bot.socket.emit("connectPlayer");
        }

        bot.socket.on('gameStarted', function() {
            bot.initializePlayerRiskScores();
        });

        bot.socket.on("updatePlayers", function (players) {
            //updatePlayers(players, name);
            //console.log("in Bot Class on updatePlayers: ");
            // console.log(players)
            // console.log(`my socket id is: ${socket.id}`)
            bot.players = players;
            for (let i in players) {
                //console.log(`Players Name: ${players[i].name}`);
                // playerCounters[i] = {
                //     name: players[i].name,
                //     value: 0
                // };
                if (players[i].socketID === bot.socket.id) {
                    //console.log(`my identity is: ${players[i].name}`)
                    //console.log(`my character is ${players[i].team}`)
                    bot.team = players[i].team;
                }
            }

        });

        bot.socket.on("gameReady", function () {
            console.log("Bot Ready for Game!");
        });

        // Function For Bot to Decide Whether it Will
        // Accept or Reject the Vote for Quest Teams
        bot.socket.on("acceptOrRejectTeam", function (data) {
            if (data.bool === true) {
                let botDecision = bot.botQuestTeamVote(data.onQuest);
                bot.socket.emit("questTeamDecision", {
                    name: bot.name,
                    decision: botDecision
                });
                console.log(`acceptOrRejectTeam: ${bot.name} Sent ${botDecision}`);
            }
        });

        bot.socket.on('updateHistoryModal', function (data) {
            bot.questHistory = data;
            bot.updatePlayerRiskScores(data);

        });

        bot.socket.on('choosePlayersForQuest', function (data) {
            //console.log(`Leader Bot: ${bot.leader}, ${bot.name}`);
            bot.leader = true;
            console.log(`Leader Bot: ${bot.leader}, ${bot.name}`);
            if (bot.leader === true && data.bool === true) {
                bot.botLeaderPicks(data);
            }
        });


        // Succeeding or Failing Quests
        bot.socket.on('goOnQuest', function () {
            let botDecision = bot.botQuestVote();
            bot.socket.emit('questVote', {
                name: bot.name,
                decision: botDecision
            });
            console.log(`In Quest: ${bot.name} Sent ${botDecision}`);
        });


        // Bot Attempt at Assassination
        // Again Currently just making a choice at Random
        bot.socket.on('beginAssassination', function (msg) {
            console.log(`My Name is: ${bot.name} And I got this from Server: ${msg}`);
            var toAssassinate = Math.floor(Math.random() * bot.players.length);
            while(bot.players[toAssassinate].team === 'Evil'){
                toAssassinate = Math.floor(Math.random() * bot.players.length);
            }
            console.log(`toAssassinate: ${toAssassinate}`);
            console.log(`Players To Assassinate: ${playersToChoose[toAssassinate].name}`);

            bot.socket.emit('assassinatePlayer', bot.players[toAssassinate].name);
        });

    }

    /**************************************FUNCTIONS**********************************/
    //BELOW THIS LINE, REFERENCE TO ANY BOT OBJECT MEMBER VARIABLES/FUNCTIONS IS USING this KEYWORD, EX this.socket.emit()

    createSocketConnection(port) {
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

    static createBotName() {
        /**
         * Lets get the Name of the bot,
         * Completely Randomized
         * @property {"The Bot"} = Middle name to show client console that it is a bot
         * Will be removed later
         */
        var firstName = firstNames[(nameStart++) % (firstNames.length)];
        var lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        var middleName = " The Bot ";

        var name = firstName.concat(middleName);

        console.log(`Name is: ${name}`);
        return name;
    }

    //used so when bots iterate through player list it doesn't always start with same player
    getRandomStartingIndex() {
        return Math.floor(Math.random() * this.players.length);
    }

    //bot is quest leader adding players
    addToQuestAtIndex(value) {
        this.socket.emit("addPlayerToQuest", playersToChoose[value].name);
    }

    //bot is quest leader adding players
    addToQuestByName(name) {
        for (let i in playersToChoose) {
            if (playersToChoose[i].name === name) {
                this.socket.emit("addPlayerToQuest", playersToChoose[i].name);
                console.log(`emitted ${playersToChoose[i].name} to Server`);
            }
        }
    }

    /***********generic bot decisions*********/

    botLeaderPicks(data) {
        if (this.team === 'Evil') {
            this.makeEvilLeaderPicks(data);
        } else if (this.team === 'Good') {
            this.makeGoodLeaderPicks(data);
        }
    }

    // Bot decides Whether it Will Accept or Reject the Quest Team
    botQuestTeamVote(playersOnQuest) {
        var decision;

        if (this.team === 'Evil') {
            decision = this.makeEvilQuestTeamVote(playersOnQuest);
            //console.log(`My Name is ${this.name} with ${this.team} And I see ${util.inspect(playersOnQuest,true, null, true)}`);
        } else if (this.team === 'Good') {
            decision = this.makeGoodQuestTeamVote(playersOnQuest);
            console.log(`My Name is ${this.name} with ${this.team} And I see ${util.inspect(playersOnQuest,true, null, true)}`);
            //decision = 'accept'; //TODO: get rid of this line once makeGoodTeamQuestVote works properly
        }

        return decision;
    }

    // bot is on quest, deciding whether to succeed or fail
    botQuestVote() {
        var decision;
        if (this.team === 'Evil') {
            decision = this.makeEvilVoteDecision();
        } else if (this.team === 'Good') {
            decision = 'succeed';
        }
        return decision;
    }

    /*************************evil bot decisions************************/

    makeEvilLeaderPicks(data){
        var currentQuestNum = data.currentQuestNum;
        var players = data.players;
        // console.log(`On Quest: ${currentfQuestNum}`);
        // console.log(`Players: ${players}`);
        //console.log(`number of players: ${players.length}`);
        var playersOnQuestNum = PLAYERS_ON_QUEST[players.length - 5][currentQuestNum - 1];
        console.log(`Choosing ${playersOnQuestNum} players for quest #${currentQuestNum} with ${players.length} players.`);
        //choose only one evil player to go on quest
        for (let i = 0; i < players.length; i++) {
            if(players[i].team === 'Evil' && players[i].name !== this.name){
                console.log(`Chose: ${players[i].name}`);
                players[i].onQuest = true;
                this.socket.emit("addPlayerToQuest", players[i].name);
                this.socket.emit('updatePlayers');
                break;
            }
        }
        var count = 0;
        for (let i = 0; i < players.length; i++) {
            if(players[i].team !== 'Evil' && count < playersOnQuestNum){
                count++;
                console.log(`Chose: ${players[i].name}`);
                players[i].onQuest = true;
                this.socket.emit("addPlayerToQuest", players[i].name);
                this.socket.emit('updatePlayers');
            }
        }
        this.leader = false;
        this.socket.emit('questTeamConfirmed');
    }

    makeEvilQuestTeamVote(playersOnQuest){
        let playersOnQuestNum = playersOnQuest.length - 1;
        let evilAmount = 0;
        let goodAmount = 0;

        for(let i = 0; i < playersOnQuestNum; i++){
            for(let x = 0; x < this.players.length; x++){
                if(playersOnQuest[i].name === this.players[x].name){
                    if(this.players[x].team === 'Evil'){
                        evilAmount++;
                    }else{
                        goodAmount++;
                    }
                }
            }
        }
        if(playersOnQuestNum > evilAmount){
            return 'accept';
        }else{
            return 'reject';
        }
    }

    makeEvilVoteDecision() {
         //TODO: don't fail first quest ever
         //check if there are other evil players on quest
         //if there are, only fail sometimes (rng)
        return 'fail';
    }

    mostLikelyMerlin(){
        //TODO: implement mostLikelyMerlin
    }

    /*************************good bot decisions**********************/

    makeGoodLeaderPicks(data){
        var currentQuestNum = data.currentQuestNum;
        var players = data.players;

        // console.log(`On Quest: ${currentfQuestNum}`);
        // console.log(`Players: ${players}`);
        //console.log(`number of players: ${ this.players.length}`);
        var playersOnQuestNum = PLAYERS_ON_QUEST[players.length - 5][currentQuestNum - 1];
        if(currentQuestNum === 1){
            for (let i = 0; i < playersOnQuestNum; i++) {
                console.log(`Chose: ${players[i].name}`);
                this.players[i].onQuest = true;
                this.socket.emit("addPlayerToQuest", players[i].name);
                this.socket.emit('updatePlayers');
            }
        }else if (currentQuestNum === 2) {
            for (let i = 0; i < playersOnQuestNum; i++) {
                console.log(`Chose: ${players[i].name}`);
                this.players[i].onQuest = true;
                this.socket.emit("addPlayerToQuest", players[i].name);
                this.socket.emit('updatePlayers');
            }
        }else {
            var count = 0;
            for (let i = 0; i < players.length; i++) {
                if ( this.players[i].team === 'Good' && count < playersOnQuestNum) {
                    count++;
                    console.log(`Chose: ${players[i].name}`);
                    this.players[i].onQuest = true;
                    this.socket.emit("addPlayerToQuest", players[i].name);
                    this.socket.emit('updatePlayers');
                }
            }
        }

        this.leader = false;
        this.socket.emit('questTeamConfirmed');
    }

    makeGoodQuestTeamVote(playersOnQuest) {
        return 'accept';
    }

    /******* bot intelligence functions (risk scores)*****/

    initializePlayerRiskScores() {
        console.log(`------initializing playerRiskScores for ${this.name}------`);
        this.playerRiskScores = [];
        for(let i = 0; i < this.players.length; i++) {
            let known = false;
            let risk = 0;
            if(this.players[i].team !== 'hidden') {
                known = true;
                if(this.players[i].team === "Evil") {
                    risk = 100;
                }
                else if(this.players[i].team === "Good") {
                    risk = -100;
                }
            }

            // structure of playerRiskScore is player's name, boolean if we know who they are, and risk
            let playerRiskScore = {
                playerName: this.players[i].name,
                team: this.players[i].team,
                risk: risk
            };
            this.playerRiskScores.push(playerRiskScore);
            console.log(playerRiskScore);
        }
    }

    //called when quest history is updated
    updatePlayerRiskScores(data) {
        //this double for loop is just for testing/logging, not part of logic:
        console.log(`------updating player risk score for ${this.name}------`);


        //actual riskScore logic
        if(this.questHistory[this.lastQuest] != undefined) {
            //the latest quest history object:
            let quest = this.questHistory[this.lastQuest][this.lastVoteTrack];

            if (quest.success != null) { //only update player risk scores if quest actually happened
                for (let i = 0; i < this.players.length; i++) {
                    //check for quest leader
                    if (quest.leader === this.players[i].name && this.players[i].team === 'hidden') {
                        //console.log(`Last Quest Leader was: ${this.players[i].name}`);
                        if (quest.success) { //quest succeeded
                            this.playerRiskScores[i].risk--;
                            console.log(this.playerRiskScores[i]);
                        }
                        else { //quest failed
                            this.playerRiskScores[i].risk++;
                            console.log(this.playerRiskScores[i]);
                        }
                    }
                    //check for player on quest
                    if (quest.playersOnQuest.includes(this.players[i].name) && this.players[i].team === 'hidden') {
                        //console.log(`Last Quest Team included: ${this.players[i].name}`);
                        if(quest.success) {
                            //decrement risk score because quest succeeded
                            this.playerRiskScores[i].risk--;
                        } else {
                            //increment risk score by number of failed votes
                            this.playerRiskScores[i].risk += quest.votes.fail;
                        }
                        console.log(this.playerRiskScores[i]);
                    }
                }
                //quest happened, increment lastQuest and reset lastvoteTrack
                this.lastQuest++;
                this.lastVoteTrack = 1;
            } else {
                //quest team was rejected, increment lastVoteTrack
                this.lastVoteTrack++;
            }
        }

    }


    awardPlayer(name) {
        for (let i in playerCounters) {
            if (playerCounters[i].name === name) {
                playerCounters[i].value++;
            }
        }
    }

    punishPlayer(name) {
        for (let i in playerCounters) {
            if (playerCounters[i].name === name) {
                playerCounters[i].value--;
            }
        }
    }

    // Iterate PlayerCounter Tallies Function
    tallyPlayerCounter(i, j) {
        for (let i in playerCounters) {
            // Check to see if Below 0. Means they Rejected First Quest and/Vote
            if (playerCounters[i].value < i)
                doNotAdd.push(playerCounters[i].name);
            else if (playerCounters[i].value >= i && playerCounters[i].value < j)
                possibleAdd.push(playerCounters[i].name);
            else if (playerCounters[i].value >= j)
                definitelyAdd.push(playerCounters[i].name);
        }
    }

    maxValueIndex(array) {
        if (array.length === 0) {
            return -1;
        }

        var max = array[0];
        var maxIndex = 0;

        for (var i = 1; i < array.length; i++) {
            if (array[i] > max) {
                maxIndex = i;
                max = array[i];
            }
        }

        return maxIndex;
    }

};