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

// The Following Arrays are for the Adding and Not adding of Clients to Quest Teams
var definitelyAdd = [];
var possibleAdd = [];
var doNotAdd = [];

const PLAYERS_ON_QUEST = [
    //5 6 7 8 9 10 players
    [2, 3, 2, 3, 3],
    [2, 3, 4, 3, 4],
    [2, 3, 3, 4, 4],
    [3, 4, 4, 5, 5],
    [3, 4, 4, 5, 5],
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
        this.questHistory = [];
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
                //console.log(`Players Name: ${players[i].name}`);
                playerCounters[i] = {
                    name: players[i].name,
                    value: 0
                };
                //
                //console.log(`PlayersCounter Name: ${playerCounters[i].name} And Value: ${playerCounters[i].value}`);
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
                    //console.log(`acceptOrRejectTeamBot Data On bot ${bot.name}: ${util.inspect(data.onQuest[i], true, null, true)}`);
                }
                let botDecision = botDecisionQuest(data.onQuest, data.players);
                socket.emit("questTeamDecision", {
                    name: bot.name,
                    decision: botDecision
                });
                console.log(`${bot.name} Sent ${botDecision}`);
            }
        });

        // Function For Bot to Decide Whether it Will
        // Accept or Reject the Quest
        function botDecisionQuest(playersOnQuest, players) {
            var decision = makeEvilQuestDecision(playersOnQuest, players);

            if (bot.team === 'Evil') {
                decision = 'reject';
                console.log(`My Name is ${bot.name} with ${bot.team} And I see ${util.inspect(playersOnQuest,true, null, true)}`);
            } else if (bot.team === 'Good') {
                console.log(`My Name is ${bot.name} with ${bot.team} And I see ${util.inspect(playersOnQuest,true, null, true)}`);
                decision = 'accept';
            }

            return decision;
        }

        function makeEvilLeaderPicks(data){
            var currentQuestNum = data.currentQuestNum;
            var players = data.players;

            // console.log(`On Quest: ${currentfQuestNum}`);
            // console.log(`Players: ${players}`);
            //console.log(`number of players: ${players.length}`);
            var playersOnQuestNum = PLAYERS_ON_QUEST[players.length - 5][currentQuestNum - 1];
            console.log(`Choosing ${playersOnQuestNum} players for quest #${currentQuestNum} with ${players.length} players.`);
            //choose only one evil player to go on quest
            for (let i = 0; i < players.length; i++) {
                if(players[i].team === 'Evil' && players[i].name !== bot.name){
                    console.log(`Chose: ${players[i].name}`);
                    players[i].onQuest = true;
                    socket.emit("addPlayerToQuest", players[i].name);
                    socket.emit('updatePlayers');
                    break;
                }
            }
            var count = 0;
            for (let i = 0; i < players.length; i++) {
                if(players[i].team !== 'Evil' && count < playersOnQuestNum){
                    count++;
                    console.log(`Chose: ${players[i].name}`);
                    players[i].onQuest = true;
                    socket.emit("addPlayerToQuest", players[i].name);
                    socket.emit('updatePlayers');
                }
            }
            bot.leader = false;
            socket.emit('questTeamConfirmed');
        }

        function makeEvilQuestDecision(playersOnQuest, players){
            let playersOnQuestNum = playersOnQuest.length - 1;
            let evilAmount = 0;
            let goodAmount = 0;

            for(let i = 0; i < playersOnQuestNum; i++){
                for(let x = 0; x < players.length; x++){
                    if(playersOnQuest[i].name === players[x].name){
                        if(players[x].team === 'Evil'){
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

        function makeEvilVoteDecision(){
            return 'fail';
        }

        function botQuestVote() {
            var decision;
            if (bot.team === 'Evil') {
                decision = makeEvilVoteDecision();
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

            var name = firstName.concat(middleName);

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

            this.questHistory = data;
        /*    if(data.length > 0) {
                questHistory1 = data[1];
                questHistory2 = data[2];
                questHistory3 = data[3];
                questHistory4 = data[4];
                questHistory5 = data[5];

            }*/
            // console.log(`Quest History 1 is: ${util.inspect(questHistory1, false, null, true)}`);
        });

        // Bot Chooses Players For Quest
        // Currently just dummy Version
        // Algorithm Can be applied later via Functions
        socket.on('choosePlayersForQuest', function (data) {
            //console.log(`Leader Bot: ${bot.leader}, ${bot.name}`);
            bot.leader = true;
            //console.log(`Leader Bot: ${bot.leader}, ${bot.name}`);
            if (bot.leader === true && data.bool === true) {
                if (bot.team === 'Evil') {
                    makeEvilLeaderPicks(data);
                } else if (bot.team === 'Good') {
                    //makeGoodLeaderPicks(data);
                    var currentQuestNum = data.currentQuestNum;
                    var players = data.players;

                    // console.log(`On Quest: ${currentfQuestNum}`);
                    // console.log(`Players: ${players}`);
                    console.log(`number of players: ${players.length}`);
                    var playersOnQuestNum = PLAYERS_ON_QUEST[players.length - 5][currentQuestNum - 1];
                    if(currentQuestNum === 1){
                        for (let i = 0; i < playersOnQuestNum; i++) {
                            console.log(`Chose: ${players[i].name}`);
                            players[i].onQuest = true;
                            socket.emit("addPlayerToQuest", players[i].name);
                            socket.emit('updatePlayers');
                        }
                        bot.leader = false;
                        socket.emit('questTeamConfirmed');
                    }else if (currentQuestNum === 2){
                        for (let i = 0; i < playersOnQuestNum; i++) {
                            console.log(`Chose: ${players[i].name}`);
                            players[i].onQuest = true;
                            socket.emit("addPlayerToQuest", players[i].name);
                            socket.emit('updatePlayers');
                        }
                        bot.leader = false;
                        socket.emit('questTeamConfirmed');
                    }else{
                        var count = 0;
                        for (let i = 0; i < players.length; i++) {
                            if(players[i].team === 'Good' && count < playersOnQuestNum){
                                count++;
                                console.log(`Chose: ${players[i].name}`);
                                players[i].onQuest = true;
                                socket.emit("addPlayerToQuest", players[i].name);
                                socket.emit('updatePlayers');
                            }
                        }
                        bot.leader = false;
                        socket.emit('questTeamConfirmed');
                    }

                }
            }
        });


        // Succeeding or Failing Quests
        socket.on('goOnQuest', function () {
            let botDecision = botQuestVote();
            socket.emit('questVote', {
                name: bot.name,
                decision: botDecision
            });
            console.log(`In Quest: ${bot.name} Sent ${botDecision}`);
        });



        // Bot Attempt at Assassination
        // Again Currently just making a choice at Random
        socket.on('beginAssassination', function (msg) {
            console.log(`My Name is: ${bot.name} And I got this from Server: ${msg}`);
            var toAssassinate = Math.floor(Math.random() * playersToChoose.length);
            while(playersToChoose[toAssassinate].team === 'Evil'){
                toAssassinate = Math.floor(Math.random() * playersToChoose.length);
            }
            console.log(`toAssassinate: ${toAssassinate}`);
            console.log(`Players To Assassinate: ${playersToChoose[toAssassinate].name}`);

            socket.emit('assassinatePlayer', playersToChoose[toAssassinate].name);;
        });

        function makeGoodLeaderPicks(data){
            var currentQuestNum = data.currentQuestNum;
            var players = data.players;


            // console.log(`On Quest: ${currentQuestNum}`);
            // console.log(`Players: ${players}`);
            console.log(`number of players: ${players.length}`);
            var playersOnQuestNum = PLAYERS_ON_QUEST[players.length - 5][currentQuestNum - 1];
            //console.log(`Current Quest Number: ${currentQuestNum}`);

            if (currentQuestNum <= 5) {
                switch (currentQuestNum) {
                    case 1:
                        // Since First Quest I will always nominate myself for Quest and Other Person/Persons
                        console.log(`In Case 1`);
                        socket.emit("addPlayerToQuest", bot.name);

                        //Iterate through object to remove self
                        for (i in players) {
                            if (players[i].name === bot.name)
                                players.splice(i, 1);
                        }

                        // Iterate remaining List to pick people
                        for (var i = 0; i < playersOnQuestNum - 1; i++) {
                            //console.log(`Chose: ${players[i].name}`);
                            players[i].onQuest = true;
                            addToQuestAtIndex(i);
                            socket.emit('updatePlayers')
                        }
                        break;
                    case 2:
                        //console.log(`QuestHistory1: ${util.inspect(questHistory1.playersOnQuest[0],true, null, true)}`)
                        console.log(`In Case 2:`)
                        console.log(`players to Add: ${playersOnQuestNum}`);
                        // Iterate Through Quest History to Award Trust or Punish
                        // Based on People Who Went to Quest
                        // for (let i in questHistory1.playersOnQuest) {
                        //     if (questHistory1.playersOnQuest[i] === bot.name) {
                        //         i++
                        //     } else {
                        //         if (questHistory1.success === true)
                        //             awardPlayer(questHistory1.playersOnQuest[i])
                        //         else
                        //             punishPlayer(questHistory1.playersOnQuest[i])
                        //     }
                        // }

                        // // Now Iterate to Award and Punish
                        // // Based on Voting
                        // for (let i in questHistory1.questTeamDecisions.accept) {
                        //     if (questHistory1.questTeamDecisions.accept[i] === bot.name) {
                        //         i++
                        //     } else {
                        //         awardPlayer(questHistory1.questTeamDecisions.accept[i])
                        //     }
                        // }

                        // for (let i in questHistory1.questTeamDecisions.reject) {
                        //     if (questHistory1.questTeamDecisions.reject[i] === bot.name) {
                        //         i++
                        //     } else {
                        //         punishPlayer(questHistory1.questTeamDecisions.reject[i])
                        //     }
                        // }


                        iterateQuest1();

                        // Now that the Tallies are Made lets See who we Should add
                        // Iterate PlayerCounter
                        tallyPlayerCounter(0, 2);

                        // Now We can go ahead and start pushing to Server the Players We want on Quest
                        console.log(`definiteAdd.length: ${definitelyAdd.length}`);
                        for (let i in definitelyAdd) {
                            if (playersOnQuestNum != 0) {
                                addToQuestByName(definitelyAdd[i]);
                                console.log(`DefiniteAdd${i}: ${definitelyAdd[i]}`)
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        for (let i in possibleAdd) {
                            if (playersOnQuestNum != 0) {
                                addToQuestByName(possibleAdd[i]);
                                console.log(`possibleAdd${i}: ${possibleAdd[i]}`)
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        //Last Case Resort I will have to Pick from this Array
                        for (let i in doNotAdd) {
                            if (playersOnQuestNum != 0) {
                                var maxIndex = maxValueIndex(doNotAdd);
                                addToQuestByName(doNotAdd[maxIndex]);
                                console.log(`doNotAdd${maxIndex}: ${doNotAdd[maxIndex]}`)
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);



                        for (let i in playerCounters) {
                            console.log(`PlayerName: ${playerCounters[i].name} And Value: ${playerCounters[i].value}`);
                        }
                        // for (let i in questHistory1) {
                        //     if (questHistory1.success === true)
                        //         console.log(`questHistory1.sucess: ${questHistory1.success}`);
                        // }
                        break;

                    case 3:
                        console.log(`In Case 3:`)
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        // I Need to re-Initialize the 'Add' Arrays
                        // Because This Case will have different Weight Criteria
                        definitelyAdd.length = 0;
                        possibleAdd.length = 0;
                        doNotAdd.length = 0;

                        iterateQuest2();

                        // Now that the Tallies are Made lets See who we Should add
                        // Iterate PlayerCounter
                        tallyPlayerCounter(2, 4)

                        // Now We can go ahead and start pushing to Server the Players We want on Quest

                        for (let i in definitelyAdd) {
                            if (playersOnQuestNum != 0) {
                                addToQuestByName(definitelyAdd[i]);
                                console.log(`DefiniteAdd${i}: ${definitelyAdd[i]}`)
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        for (let i in possibleAdd) {
                            if (playersOnQuestNum != 0) {
                                addToQuestByName(possibleAdd[i]);
                                console.log(`possibleAdd${i}: ${possibleAdd[i]}`)
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        //Last Case Resort I will have to Pick from this Array
                        // Smarter implementation is to use 'sort()'
                        // It will rearrange array from least to greatest
                        // I can get get length - i for the remainder of the Selects
                        doNotAdd.sort();
                        for (let i in doNotAdd) {
                            if (playersOnQuestNum != 0) {
                                addToQuestByName(doNotAdd[doNotAdd.length - i]);
                                console.log(`doNotAdd${doNotAdd.length-i}: ${doNotAdd[doNotAdd.length-i]}`);
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        for (let i in playerCounters) {
                            console.log(`PlayerName: ${playerCounters[i].name} And Value: ${playerCounters[i].value}`);
                        }

                        break;
                    case 4:
                        console.log(`In Case 4:`)
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        // I Need to re-Initialize the 'Add' Arrays
                        // Because This Case will have different Weight Criteria
                        definitelyAdd.length = 0;
                        possibleAdd.length = 0;
                        doNotAdd.length = 0;

                        iterateQuest3();

                        // Now that the Tallies are Made lets See who we Should add
                        // Iterate PlayerCounter
                        tallyPlayerCounter(4, 6);

                        // Now We can go ahead and start pushing to Server the Players We want on Quest

                        for (let i in definitelyAdd) {
                            if (playersOnQuestNum != 0) {
                                addToQuestByName(definitelyAdd[i]);
                                console.log(`DefiniteAdd${i}: ${definitelyAdd[i]}`)
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        for (let i in possibleAdd) {
                            if (playersOnQuestNum != 0) {
                                addToQuestByName(possibleAdd[i]);
                                console.log(`possibleAdd${i}: ${possibleAdd[i]}`)
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        //Last Case Resort I will have to Pick from this Array
                        // Smarter implementation is to use 'sort()'
                        // It will rearrange array from least to greatest
                        // I can get get length - i for the remainder of the Selects
                        doNotAdd.sort();
                        for (let i in doNotAdd) {
                            if (playersOnQuestNum != 0) {
                                addToQuestByName(doNotAdd[doNotAdd.length - i]);
                                console.log(`doNotAdd${doNotAdd.length-i}: ${doNotAdd[doNotAdd.length-i]}`);
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        for (let i in playerCounters) {
                            console.log(`PlayerName: ${playerCounters[i].name} And Value: ${playerCounters[i].value}`);
                        }
                        break;
                    case 5:
                        console.log(`In Case 5:`);
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        // I Need to re-Initialize the 'Add' Arrays
                        // Because This Case will have different Weight Criteria
                        definitelyAdd.length = 0;
                        possibleAdd.length = 0;
                        doNotAdd.length = 0;

                        iterateQuest4();

                        // Now that the Tallies are Made lets See who we Should add
                        // Iterate PlayerCounter
                        tallyPlayerCounter(6, 8);

                        // Now We can go ahead and start pushing to Server the Players We want on Quest

                        for (let i in definitelyAdd) {
                            if (playersOnQuestNum != 0) {
                                addToQuestByName(definitelyAdd[i]);
                                console.log(`DefiniteAdd${i}: ${definitelyAdd[i]}`)
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        for (let i in possibleAdd) {
                            if (playersOnQuestNum != 0) {
                                addToQuestByName(possibleAdd[i]);
                                console.log(`possibleAdd${i}: ${possibleAdd[i]}`)
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        //Last Case Resort I will have to Pick from this Array
                        // Smarter implementation is to use 'sort()'
                        // It will rearrange array from least to greatest
                        // I can get get length - i for the remainder of the Selects
                        doNotAdd.sort();
                        for (let i in doNotAdd) {
                            if (playersOnQuestNum != 0) {
                                addToQuestByName(doNotAdd[doNotAdd.length - i]);
                                console.log(`doNotAdd${doNotAdd.length-i}: ${doNotAdd[doNotAdd.length-i]}`);
                                playersOnQuestNum--;
                            }
                        }
                        console.log(`players to Add: ${playersOnQuestNum}`);

                        for (let i in playerCounters) {
                            console.log(`PlayerName: ${playerCounters[i].name} And Value: ${playerCounters[i].value}`);
                        }

                        break;
                }
            } //else {
            //     for (var i = 0; i < playersOnQuestNum; i++) {
            //         //console.log(`Chose: ${players[i].name}`);
            //         players[i].onQuest = true;
            //         socket.emit("addPlayerToQuest", players[i].name);
            //         socket.emit('updatePlayers')
            //         //console.log(`QuestHistory1: ${util.inspect(questHistory1,true, null, true)}`)

            //     }
            // }
            bot.leader = false;
            socket.emit('questTeamConfirmed');
        }

        function mostLikelyMerlin(){

            // let leadersOfSucceedQuest = [[],[]];
            // let playersOnSucceedQuest = [];
            // let merlinName;
            // let count = 0;
            // let foundTrack = false;
            // let trackNum = 1;
            //
            // /*while(!foundTrack){
            //     if(questHistory1[trackNum] !== null){
            //         foundTrack = true;
            //     }else{
            //         trackNum++;
            //     }
            // }
            // if(questHistory1[trackNum].success){
            //     leadersOfSucceedQuest.push(questHistory1[trackNum].leader);
            //     for(let i = 0; i < questHistory1[trackNum].playersOnQuest.length; i++){
            //         playersOnSucceedQuest.push(questHistory1[trackNum].playersOnQuest[i]);
            //     }
            // }*/
            //
            //
            //
            // /*foundTrack = false;
            // trackNum = 1;
            // while(!foundTrack){
            //     if(questHistory2[trackNum] !== null){
            //         foundTrack = true;
            //     }else{
            //         trackNum++;
            //     }
            // }
            // if(questHistory2[trackNum].success){
            //     leadersOfSucceedQuest.push(questHistory2[trackNum].leader);
            //     for(let i = 0; i < questHistory2[trackNum].playersOnQuest.length; i++){
            //         playersOnSucceedQuest.push(questHistory2[trackNum].playersOnQuest[i]);
            //     }
            // }
            //
            // foundTrack = false;
            // trackNum = 1;
            // while(!foundTrack){
            //     if(questHistory3[trackNum] !== null){
            //         foundTrack = true;
            //     }else{
            //         trackNum++;
            //     }
            // }
            // if(questHistory3[trackNum].success){
            //     leadersOfSucceedQuest.push(questHistory3[trackNum].leader);
            //     for(let i = 0; i < questHistory3[trackNum].playersOnQuest.length; i++){
            //         playersOnSucceedQuest.push(questHistory3[trackNum].playersOnQuest[i]);
            //     }
            // }
            //
            // foundTrack = false;
            // trackNum = 1;
            // while(!foundTrack){
            //     if(questHistory4[trackNum] !== null){
            //         foundTrack = true;
            //     }else{
            //         trackNum++;
            //     }
            // }
            // if(questHistory4[trackNum].success){
            //     leadersOfSucceedQuest.push(questHistory4[trackNum].leader);
            //     for(let i = 0; i < questHistory4[trackNum].playersOnQuest.length; i++){
            //         playersOnSucceedQuest.push(questHistory4[trackNum].playersOnQuest[i]);
            //     }
            // }
            //
            // foundTrack = false;
            // trackNum = 1;
            // while(!foundTrack){
            //     if(questHistory5[trackNum] !== null){
            //         foundTrack = true;
            //     }else{
            //         trackNum++;
            //     }
            // }
            // if(questHistory5[trackNum].success){
            //     leadersOfSucceedQuest.push(questHistory5[trackNum].leader);
            //     for(let i = 0; i < questHistory5[trackNum].playersOnQuest.length; i++){
            //         playersOnSucceedQuest.push(questHistory5[trackNum].playersOnQuest[i]);
            //     }
            // }*/
            // for(let i = 0; i < leadersOfSucceedQuest.length; i++){
            //     for(let x = 0; x < playersOnSucceedQuest.length; x++){
            //         if(leadersOfSucceedQuest[i] === playersOnSucceedQuest[x]){
            //             leadersOfSucceedQuest[i].push(playersOnSucceedQuest[x]);
            //         }
            //     }
            // }
            // for(let i = 0; i < leadersOfSucceedQuest.length; i++){
            //     if(leadersOfSucceedQuest[i].length > count){
            //         merlinName = leadersOfSucceedQuest[i].name;
            //         count = leadersOfSucceedQuest[i].length;
            //     }
            // }
            // return merlinName;
        }

        function addToQuestAtIndex(value) {
            socket.emit("addPlayerToQuest", playersToChoose[value].name);
        }

        function addToQuestByName(name) {
            for (let i in playersToChoose) {
                if (playersToChoose[i].name === name) {
                    socket.emit("addPlayerToQuest", playersToChoose[i].name);
                    console.log(`emitted ${playersToChoose[i].name} to Server`);
                }
            }
        }

        function awardPlayer(name) {
            for (let i in playerCounters) {
                if (playerCounters[i].name === name) {
                    playerCounters[i].value++;
                }
            }
        }

        function punishPlayer(name) {
            for (let i in playerCounters) {
                if (playerCounters[i].name === name) {
                    playerCounters[i].value--;
                }
            }
        }

        // Iterate PlayerCounter Tallies Function
        function tallyPlayerCounter(i, j) {
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

        function iterateQuest1() {
            // Iterate Through Quest History to Award Trust or Punish
            // Based on People Who Went to Quest 
            for (let i in questHistory1.playersOnQuest) {
                if (questHistory1.playersOnQuest[i] === bot.name) {
                    i++
                } else {
                    if (questHistory1.success === true)
                        awardPlayer(questHistory1.playersOnQuest[i]);
                    else
                        punishPlayer(questHistory1.playersOnQuest[i]);
                }
            }


            // Now Iterate to Award and Punish
            // Based on Voting
            for (let i in questHistory1.questTeamDecisions.accept) {
                if (questHistory1.questTeamDecisions.accept[i] === bot.name) {
                    i++
                } else {
                    awardPlayer(questHistory1.questTeamDecisions.accept[i]);
                }
            }

            for (let i in questHistory1.questTeamDecisions.reject) {
                if (questHistory1.questTeamDecisions.reject[i] === bot.name) {
                    i++;
                } else {
                    punishPlayer(questHistory1.questTeamDecisions.reject[i]);
                }
            }
        }


        function iterateQuest2() {
            // Iterate Through Quest History to Award Trust or Punish
            // Based on People Who Went to Quest 
            for (let i in questHistory2.playersOnQuest) {
                if (questHistory2.playersOnQuest[i] === bot.name) {
                    i++;
                } else {
                    if (questHistory2.success === true)
                        awardPlayer(questHistory2.playersOnQuest[i]);
                    else
                        punishPlayer(questHistory2.playersOnQuest[i]);
                }
            }


            // Now Iterate to Award and Punish
            // Based on Voting
            for (let i in questHistory2.questTeamDecisions.accept) {
                if (questHistory2.questTeamDecisions.accept[i] === bot.name) {
                    i++
                } else {
                    awardPlayer(questHistory1.questTeamDecisions.accept[i])
                }
            }

            for (let i in questHistory2.questTeamDecisions.reject) {
                if (questHistory2.questTeamDecisions.reject[i] === bot.name) {
                    i++
                } else {
                    punishPlayer(questHistory2.questTeamDecisions.reject[i])
                }
            }
        }


        function iterateQuest3() {
            // Iterate Through Quest History to Award Trust or Punish
            // Based on People Who Went to Quest 
            for (let i in questHistory3.playersOnQuest) {
                if (questHistory3.playersOnQuest[i] === bot.name) {
                    i++
                } else {
                    if (questHistory3.success === true)
                        awardPlayer(questHistory3.playersOnQuest[i])
                    else
                        punishPlayer(questHistory3.playersOnQuest[i])
                }
            }


            // Now Iterate to Award and Punish
            // Based on Voting
            for (let i in questHistory3.questTeamDecisions.accept) {
                if (questHistory3.questTeamDecisions.accept[i] === bot.name) {
                    i++
                } else {
                    awardPlayer(questHistory3.questTeamDecisions.accept[i])
                }
            }

            for (let i in questHistory3.questTeamDecisions.reject) {
                if (questHistory3.questTeamDecisions.reject[i] === bot.name) {
                    i++
                } else {
                    punishPlayer(questHistory3.questTeamDecisions.reject[i])
                }
            }
        }

        function iterateQuest4() {
            // Iterate Through Quest History to Award Trust or Punish
            // Based on People Who Went to Quest 
            for (let i in questHistory4.playersOnQuest) {
                if (questHistory4.playersOnQuest[i] === bot.name) {
                    i++
                } else {
                    if (questHistory4.success === true)
                        awardPlayer(questHistory4.playersOnQuest[i])
                    else
                        punishPlayer(questHistory4.playersOnQuest[i])
                }
            }


            // Now Iterate to Award and Punish
            // Based on Voting
            for (let i in questHistory4.questTeamDecisions.accept) {
                if (questHistory4.questTeamDecisions.accept[i] === bot.name) {
                    i++
                } else {
                    awardPlayer(questHistory4.questTeamDecisions.accept[i])
                }
            }

            for (let i in questHistory4.questTeamDecisions.reject) {
                if (questHistory4.questTeamDecisions.reject[i] === bot.name) {
                    i++
                } else {
                    punishPlayer(questHistory4.questTeamDecisions.reject[i])
                }
            }
        }

        function iterateQuest5() {
            // Iterate Through Quest History to Award Trust or Punish
            // Based on People Who Went to Quest 
            for (let i in questHistory5.playersOnQuest) {
                if (questHistory5.playersOnQuest[i] === bot.name) {
                    i++
                } else {
                    if (questHistory5.success === true)
                        awardPlayer(questHistory5.playersOnQuest[i])
                    else
                        punishPlayer(questHistory5.playersOnQuest[i])
                }
            }


            // Now Iterate to Award and Punish
            // Based on Voting
            for (let i in questHistory5.questTeamDecisions.accept) {
                if (questHistory5.questTeamDecisions.accept[i] === bot.name) {
                    i++
                } else {
                    awardPlayer(questHistory5.questTeamDecisions.accept[i])
                }
            }

            for (let i in questHistory5.questTeamDecisions.reject) {
                if (questHistory5.questTeamDecisions.reject[i] === bot.name) {
                    i++
                } else {
                    punishPlayer(questHistory5.questTeamDecisions.reject[i])
                }
            }
        }

        function maxValueIndex(array) {
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
    }

};