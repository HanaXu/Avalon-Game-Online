import socketIO from 'socket.io-client';

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


// the risk score above which, Good players will always reject teams with player and not put player on quest tams
//right now, the value 10 is based on nothing
const RISK_THRESHOLD = 10;

export default class GameBot {
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
        this.votedOnTeam = false;
        this.votedOnQuest = false;
        this.nextQuest = 1;
        this.nextVoteTrack = 1; // nextQuest and nextVoteTrack keep track of most recent quest history entry

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

        bot.socket.on('startGame', function () {
            bot.initializePlayerRiskScores();
        });

        bot.socket.on("updatePlayerCards", function (players) {
            //updatePlayerCards(players, name);
            //console.log("in Bot Class on updatePlayerCards: ");
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

        bot.socket.on("showStartGameBtn", function () {
            console.log("Bot Ready for Game!");
        });

        // Function For Bot to Decide Whether it Will
        // Accept or Reject the Vote for Quest Teams
        bot.socket.on("showAcceptOrRejectTeamBtns", function (data) {
            if (data.bool === true) {
                let botDecision = bot.botQuestTeamVote(data.onQuest);
                bot.socket.emit("playerAcceptsOrRejectsTeam", {
                    name: bot.name,
                    decision: botDecision
                });
                // console.log(`-----acceptOrRejectTeam: ${bot.name} Sent ${botDecision}-----`);
            }
        });

        bot.socket.on('updateHistoryModal', function (data) {
            bot.questHistory = data;
            bot.updatePlayerRiskScores(data);

        });

        bot.socket.on('showAddRemovePlayerBtns', function (data) {
            //console.log(`Leader Bot: ${bot.leader}, ${bot.name}`);
            bot.leader = true;
            // console.log(`-----Leader Bot: ${bot.leader}, ${bot.name}-----`);
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
            // console.log(`In Quest: ${bot.name} Sent ${botDecision}`);
        });


        // Bot Attempt at Assassination
        // Again Currently just making a choice at Random
        bot.socket.on('beginAssassination', function () {
            //console.log(`My Name is: ${bot.name} And I got this from Server: ${msg}`);
            var toAssassinate = Math.floor(Math.random() * bot.players.length);
            while (bot.players[toAssassinate].team === 'Evil') {
                toAssassinate = Math.floor(Math.random() * bot.players.length);
            }
            console.log(`toAssassinate: ${toAssassinate}`);

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
            // console.log(`In gameBot Class: Socket ID: ${socket.id}`);
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
        var middleName = " The Bot";

        var name = firstName.concat(middleName);

        // console.log(`Name is: ${name}`);
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
            //console.log(`My Name is ${this.name} with ${this.team} And I see ${util.inspect(playersOnQuest,true, null, true)}`);
        }
        this.votedOnTeam = true;
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
        this.votedOnQuest = true;
        return decision;
    }

    /*************************evil bot decisions************************/

    makeEvilLeaderPicks(data) {
        var currentQuestNum = data.currentQuestNum;
        var players = data.players;
        // console.log(`On Quest: ${currentfQuestNum}`);
        // console.log(`Players: ${players}`);
        //console.log(`number of players: ${players.length}`);
        var playersOnQuestNum = PLAYERS_ON_QUEST[players.length - 5][currentQuestNum - 1];
        console.log(`Choosing ${playersOnQuestNum} players for quest #${currentQuestNum} with ${players.length} players.`);
        //choose only one evil player to go on quest
        for (let i = 0; i < players.length; i++) {
            if (players[i].team === 'Evil' && players[i].name !== this.name) {
                // console.log(`Chose: ${players[i].name}`);
                players[i].onQuest = true;
                this.socket.emit("addPlayerToQuest", players[i].name);
                this.socket.emit('updatePlayerCards');
                break;
            }
        }
        var count = 0;
        for (let i = 0; i < players.length; i++) {
            if (players[i].team !== 'Evil' && count < playersOnQuestNum) {
                count++;
                // console.log(`Chose: ${players[i].name}`);
                players[i].onQuest = true;
                this.socket.emit("addPlayerToQuest", players[i].name);
                this.socket.emit('updatePlayerCards');
            }
        }
        this.leader = false;
        this.socket.emit('leaderHasConfirmedTeam');
    }

    makeEvilQuestTeamVote(playersOnQuest) {
        let playersOnQuestNum = playersOnQuest.length - 1;
        let evilAmount = 0;

        for (let i = 0; i < playersOnQuestNum; i++) {
            for (let x = 0; x < this.players.length; x++) {
                if (playersOnQuest[i].name === this.players[x].name) {
                    if (this.players[x].team === 'Evil') {
                        evilAmount++;
                    } else {
                        goodAmount++;
                    }
                }
            }
        }
        if (playersOnQuestNum > evilAmount) {
            return 'accept';
        } else {
            return 'reject';
        }
    }

    makeEvilVoteDecision() {
        //TODO: don't fail first quest ever
        //check if there are other evil players on quest
        //if there are, only fail sometimes (rng)
        return 'fail';
    }

    mostLikelyMerlin() {
        //TODO: implement mostLikelyMerlin
    }

    /*************************good bot decisions**********************/

    makeGoodLeaderPicks(data) {
        var currentQuestNum = data.currentQuestNum;
        var players = data.players;

        // console.log(`On Quest: ${currentfQuestNum}`);
        // console.log(`Players: ${players}`);
        //console.log(`number of players: ${ this.players.length}`);
        var playersOnQuestNum = PLAYERS_ON_QUEST[players.length - 5][currentQuestNum - 1];

        //find player with lowest risk score


        let sentOnQuest = [];
        for (let i = 0; i < playersOnQuestNum; i++) {
            let playerIndex = this.getLowestRiskScore(sentOnQuest);
            this.players[playerIndex].onQuest = true;
            sentOnQuest.push(this.players[playerIndex].name);
            this.socket.emit("addPlayerToQuest", players[playerIndex].name);
            this.socket.emit("updatePlayerCards");
        }

        this.leader = false;
        this.socket.emit('leaderHasConfirmedTeam');
    }

    makeGoodQuestTeamVote(playersOnQuest) {
        var response = 'accept';

        //always accept team if voteTrack is at 5
        if (this.nextVoteTrack == 5) {
            return response;
        }

        //loop over risk scores to determine each player's risk
        for (let i = 0; i < this.playerRiskScores.length; i++) {
            if (playersOnQuest.includes(this.playerRiskScores[i].playerName)) {
                // console.log(`Quest Team member ${this.playerRiskScores[i].playerName} has risk of ${this.playerRiskScores[i].risk}`);
                //check if you know for certain that they're evil
                if (this.playerRiskScores[i].team === "Evil") {
                    return 'reject';
                }
                //check for unknown player's risk score
                else if (this.playerRiskScores[i].team === "hidden") {
                    if (this.playerRiskScores[i].risk > RISK_THRESHOLD) {
                        return 'reject';
                    }
                }
            }
        }
        return response;
    }

    /******* bot intelligence functions (risk scores)*****/

    initializePlayerRiskScores() {
        // console.log(`------initializing playerRiskScores for ${this.name}------`);
        this.playerRiskScores = [];
        for (let i = 0; i < this.players.length; i++) {
            let risk = 0;
            if (this.players[i].team !== 'hidden') {
                if (this.players[i].team === "Evil") {
                    risk = 100;
                }
                else if (this.players[i].team === "Good") {
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
            // console.log(playerRiskScore);
        }
    }

    //called when quest history is updated
    updatePlayerRiskScores() {
        // console.log(`------updating player risk score for ${this.name}------`);
        if (typeof this.questHistory[this.nextQuest] !== 'undefined') {
            //the latest quest history object:
            let quest = this.questHistory[this.nextQuest][this.nextVoteTrack];

            if (typeof quest !== 'undefined' && quest.success != null) { //only update player risk scores if quest actually happened
                for (let i = 0; i < this.players.length; i++) {

                    //check for quest leader
                    if (quest.leader === this.players[i].name && this.players[i].team === 'hidden') {
                        //console.log(`Last Quest Leader was: ${this.players[i].name}`);
                        if (quest.success) { //quest succeeded
                            this.playerRiskScores[i].risk--;
                            // console.log(this.playerRiskScores[i]);
                        }
                        else { //quest failed
                            this.playerRiskScores[i].risk++;
                            // console.log(this.playerRiskScores[i]);
                        }
                    }

                    //check for player on quest
                    if (quest.playersOnQuest.includes(this.players[i].name) && this.players[i].team === 'hidden') {
                        //console.log(`Last Quest Team included: ${this.players[i].name}`);
                        if (quest.success) {
                            //decrement risk score because quest succeeded
                            this.playerRiskScores[i].risk--;
                        } else {
                            //increment risk score by number of failed votes
                            //this.playerRiskScores[i].risk += quest.votes.fail;
                            this.playerRiskScores[i].risk += 10;
                        }
                        //console.log(this.playerRiskScores[i]);
                    }

                    //check for vote Accept
                    if (quest.acceptOrRejectTeam.accept.includes(this.players[i].name)) {
                        //increment risk score if quest failed, decrement if succeeded
                        if (quest.success) {
                            //decrement risk score because quest succeeded
                            this.playerRiskScores[i].risk--;
                        } else {
                            //increment risk score by number of failed votes
                            this.playerRiskScores[i].risk += quest.votes.fail;
                        }
                        //console.log(this.playerRiskScores[i]);
                    }
                    //check for vote Reject
                    else if (quest.acceptOrRejectTeam.reject.includes(this.players[i].name)) {
                        //decrement risk score if quest failed, increment if succeeded
                        if (quest.success) {
                            //decrement risk score because quest succeeded
                            this.playerRiskScores[i].risk++;
                        } else {
                            //increment risk score by number of failed votes
                            this.playerRiskScores[i].risk--;
                        }
                    }
                    // console.log(this.playerRiskScores[i]);

                }
                //quest happened, increment nextQuest and reset lastvoteTrack
                this.nextQuest++;
                this.nextVoteTrack = 1;
            } else {
                //quest team was rejected, increment nextVoteTrack
                this.nextVoteTrack++;
            }
        }
    }


    //returns the index of the player with the lowest risk score, excluding any players passed in as params
    getLowestRiskScore(excluding) {
        let min = 100;
        let minIndex = 0;

        for (let i = 0; i < this.playerRiskScores.length; i++) {
            //only compare a player to min if they weren't excluded (ie already selected for a quest)
            if (!excluding.includes(this.playerRiskScores[i].playerName)) {
                if (this.playerRiskScores[i].risk < min) {
                    min = this.playerRiskScores[i].risk;
                    minIndex = i;
                }
            }
        }
        // console.log(`The player with the lowest risk score is ${this.playerRiskScores[minIndex].playerName} with a risk of ${this.playerRiskScores[minIndex].risk}`);
        return minIndex;
    }

    //returns the numerical risk score of given player
    getRiskScore(name) {
        for (let i = 0; i < this.playerRiskScores.length; i++) {
            if (this.playerRiskScores[i].playerName === name) {
                return this.playerRiskScores[i].risk;
            }
        }
    }

};