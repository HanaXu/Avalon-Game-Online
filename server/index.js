const express = require('express');
const app = express();
const server = app.listen(3000, () => {
  console.log('server running on port 3000');
});
const io = require('socket.io')(server);

var Game = require('../game/Game');
var Player = require('../game/Player');
var GameList = {}; //keeps record of all game objects

io.on('connection', socket => {
  var roomCode; //make roomCode available to socket

  //create a new room
  socket.on('createRoom', data => {
    roomCode = data.roomCode;
    const name = data.name;
    let roomExists = false;
    let game;

    //validation
    if (name.length < 1 || name.length > 20) {
      console.log('name does not meet length requirements: ' + name);
      socket.emit('errorMsg', 'Error: Name must be between 1-20 characters: ' + name);
      return;
    }

    socket.emit('passedValidation');
    socket.join(roomCode); //subscribe the socket to the roomcode

    //check if the room already exists in GameList
    for (let i in GameList) {
      if (GameList[roomCode] != null) {
        console.log('room already exists');
        roomExists = true;
        break;
      }
    }
    if (!roomExists) {
      console.log('room does not exist. creating new game room');
      game = new Game(roomCode);
    }

    let player = new Player(socket.id, name, roomCode, 'Host');
    game.players.push(player);
    GameList[roomCode] = game;

    console.log('GameList object after adding game:');
    console.log(GameList);

    //since player is Host, show them the game setup options (bots, optional characters)
    io.to(socket.id).emit('showHostSetupOptions');

    //emit all the game players to client, client then updates the UI
    io.in(roomCode).emit('updatePlayers', {
      players: game.players
    });
  });

  //join an existing room
  socket.on('joinRoom', data => {
    let name = data.name;
    roomCode = data.roomCode;

    //validate before letting player join a room
    if (GameList[roomCode] === undefined) {
      console.log('error joining room. room does not exist: ' + roomCode);
      socket.emit('errorMsg', "Error: Room code '" + roomCode + "' does not exist.");
      return;
    }
    else if (GameList[roomCode].gameIsStarted) {
      console.log('game has already started. cannot join');
      socket.emit('errorMsg', 'Error: Cannot join a game that has already started');
      return;
    }
    else if (name.length < 1 || name.length > 20) {
      console.log('name does not meet length requirements: ' + name);
      socket.emit('errorMsg', 'Error: Name must be between 1-20 characters: ' + name);
      return;
    }
    else if (GameList[roomCode].hasPlayerWithName(name)) {
      console.log('error someone already has name: ' + name);
      socket.emit('errorMsg', "Error: Name '" + name + "' is already taken.");
      return;
    }

    socket.emit('passedValidation');

    let player = new Player(socket.id, name, roomCode, 'Guest');
    socket.join(roomCode); //subscribe the socket to the roomcode

    GameList[roomCode].players.push(player);
    console.log(GameList);

    //emit all the game players to client, client then updates the UI
    io.in(roomCode).emit('updatePlayers', {
      players: GameList[roomCode].players
    });

    //check for game ready
    if (GameList[roomCode].players.length >= 5) {
      console.log('game ready');
      let hostSocketID = GameList[roomCode].getHostSocketID();
      io.to(hostSocketID).emit('gameReady'); //only emit to the host client
    }
  });

  //no other clients can join now that game is started
  //assign identities & assign first quest leader
  socket.on('startGame', function (data) {
    roomCode = data.roomCode;
    //an array containing names of selected optional characters
    var optionalCharacters = data.optionalCharacters;
    let errorMsg = GameList[roomCode].validateOptionalCharacters(optionalCharacters);
    if (errorMsg.length > 0) {
      socket.emit('errorMsg', errorMsg);
      return;
    }

    GameList[roomCode].gameIsStarted = true;
    GameList[roomCode].gameStage = 1;
    GameList[roomCode].initializeQuests();
    GameList[roomCode].assignIdentities(optionalCharacters);
    let leaderSocketID = GameList[roomCode].assignFirstLeader();

    startQuest(leaderSocketID, roomCode, "Beginning first quest.");

    io.in(roomCode).emit('gameStarted');
/*    //update player cards
    emitSanitizedPlayers(roomCode, GameList[roomCode].players);
    io.in(roomCode).emit('gameStarted');

    let currentQuest = GameList[roomCode].getCurrentQuest();
    //update quest cards
    io.in(roomCode).emit('updateQuests', {
      quests: GameList[roomCode].quests,
      currentQuestNum: currentQuest.questNum
    });
    //update vote track
    io.in(roomCode).emit('updateVoteTrack', {
      voteTrack: currentQuest.voteTrack
    });
    //update quest message
    io.in(roomCode).emit('updateQuestMsg', {
      questMsg:
        currentQuest.playersNeeded +
        ' more player(s) needed to go on quest ' +
        currentQuest.questNum
    });

    io.to(leaderSocketID).emit('choosePlayersForQuest'); //only let the quest leader choose players*/
  });

  socket.on('addPlayerToQuest', function (name) {
    let currentQuest = GameList[roomCode].getCurrentQuest();
    let leader = currentQuest.questLeader;
    let playersNeededLeft = GameList[roomCode].addPlayerToQuest(
      currentQuest.questNum,
      name
    );

    //update player cards
    emitSanitizedPlayers(roomCode, GameList[roomCode].players);

    //update quest message
    if (playersNeededLeft > 0) {
      io.in(roomCode).emit('updateQuestMsg', {
        questMsg:
          leader +
          ' is choosing ' +
          playersNeededLeft +
          ' more player(s) to go on quest ' +
          currentQuest.questNum
      });
    } else {
      io.in(roomCode).emit('updateQuestMsg', {
        questMsg: 'Waiting for ' + leader + ' to confirm team.'
      });
      //show confirm button to quest leader
      socket.emit('confirmQuestTeam', true);
    }
  });

  socket.on('removePlayerFromQuest', function (name) {
    let currentQuest = GameList[roomCode].getCurrentQuest();
    let leader = currentQuest.questLeader;
    let playersNeededLeft = GameList[roomCode].removePlayerFromQuest(
      currentQuest.questNum,
      name
    );

    //update player cards
    emitSanitizedPlayers(roomCode, GameList[roomCode].players);

    //update quest message
    io.in(roomCode).emit('updateQuestMsg', {
      questMsg:
        leader +
        ' is choosing ' +
        playersNeededLeft +
        ' more player(s) to go on quest ' +
        currentQuest.questNum
    });
    //hide confirm button from quest leader
    socket.emit('confirmQuestTeam', false);
  });

  socket.on('questTeamConfirmed', function () {
    io.in(roomCode).emit('acceptOrRejectTeam', 'Waiting for all players to Accept or Reject team.');
  });

  //players vote whether they like the team or not
  socket.on('questTeamDecision', function (data) {
    let name = data.name;
    let decision = data.decision;
    let currentQuest = GameList[roomCode].getCurrentQuest();

    if (decision === 'accept') {
      currentQuest.questTeamDecisions.voted.push(name);
      currentQuest.questTeamDecisions.accept.push(name);
    } else {
      currentQuest.questTeamDecisions.voted.push(name);
      currentQuest.questTeamDecisions.reject.push(name);
    }
    console.log('received decision from: ' + name);
    io.in(roomCode).emit('teamVotes', currentQuest.questTeamDecisions.voted);

    //everyone has voted, reveal the votes & move to next step
    let questMsg = "";
    if (currentQuest.questTeamDecisions.voted.length === currentQuest.totalNumPlayers) {
      //reveal all players' votes
      io.in(roomCode).emit('revealTeamVotes', currentQuest.questTeamDecisions);

      //check if Approve or Reject has majority
      if(currentQuest.questTeamDecisions.reject.length >= GameList[roomCode].players.length / 2) {
        //quest Rejected

        //choose next quest leader
        let leaderSocketID = GameList[roomCode].assignNextLeader(currentQuest.questNum);
        currentQuest.voteTrack++;

        questMsg = "Vote Results: quest team was Rejected. Vote results are below. New quest leader has been chosen.";

        startQuest(leaderSocketID, roomCode, questMsg);
      }
      else {
        //quest Approved
        //team going on quest:
        let questTeam = currentQuest.playersOnQuest;
        console.log("Quest Team is " + questTeam);


        questMsg = "Vote Results: quest team was Approved. Waiting for quest team to go on quest.";
        io.in(roomCode).emit('updateQuestMsg', questMsg);
      }
    }
  });

  socket.on('disconnect', function () {
    if (Object.keys(GameList).length != 0 && GameList[roomCode] != undefined) {
      GameList[roomCode].deletePlayer(socket.id);
      let players = GameList[roomCode].players;

      //disconnection after game start
      if (GameList[roomCode].gameIsStarted) {
        emitSanitizedPlayers(roomCode, players);
      }
      //disconnection before game start
      else {
        //emit all the game players to client, client then updates the UI
        io.in(roomCode).emit('updatePlayers', {
          players: players
        });
      }
    }
  });
});

//server side validate instead of having the client validate
//client's only job is to update the UI
function emitSanitizedPlayers(roomCode, players) {
  for (let i in players) {
    if (players[i].character === 'Percival') {
      let sanitizedPlayers = GameList[roomCode].sanitizeForPercival(players[i].socketID);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    } else if (players[i].character === 'Merlin') {
      let sanitizedPlayers = GameList[roomCode].sanitizeForMerlin(players[i].socketID);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    } else if (players[i].character === 'Minion of Mordred' || players[i].character === 'Assassin' || players[i].character === 'Mordred' || players[i].character === 'Morgana') {
      let sanitizedPlayers = GameList[roomCode].sanitizeForEvilTeam(players[i].socketID);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    } else {
      let sanitizedPlayers = GameList[roomCode].sanitizeForGoodTeam(players[i].socketID);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    }
  }
}

function startQuest(leaderSocketID, roomCode, msg) {

  //update player cards
  emitSanitizedPlayers(roomCode, GameList[roomCode].players);

  let currentQuest = GameList[roomCode].getCurrentQuest();
  //update quest cards
  io.in(roomCode).emit('updateQuests', {
    quests: GameList[roomCode].quests,
    currentQuestNum: currentQuest.questNum
  });
  //update vote track
  io.in(roomCode).emit('updateVoteTrack', {
    voteTrack: currentQuest.voteTrack
  });
  //update quest message
  io.in(roomCode).emit('updateQuestMsg', {
    questMsg:
    msg +
    "\n" +
    currentQuest.playersNeeded +
    ' more player(s) needed to go on quest ' +
    currentQuest.questNum
  });

  io.to(leaderSocketID).emit('choosePlayersForQuest'); //only let the quest leader choose players
}