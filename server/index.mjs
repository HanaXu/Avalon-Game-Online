import express from 'express';
import socketIO from 'socket.io';
import { Game } from '../game/game.mjs';
import { Player } from '../game/player.mjs';
import {
  sanitizeForGoodTeam, sanitizeForPercival,
  sanitizeForEvilTeam, sanitizeForMerlin,
  validateOptionalCharacters
} from '../game/utility.mjs';

const app = express();
const server = app.listen(3000, () => {
  console.log('server running on port 3000');
});
const io = socketIO(server);

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
      console.log(`Name does not meet length requirements: ${name}`);
      socket.emit('errorMsg', `Error: Name must be between 1-20 characters: ${name}`);
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

    // console.log('GameList object after adding game:');
    // console.log(GameList);

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
      console.log(`error joining room. room does not exist: ${roomCode}`);
      socket.emit('errorMsg', `Error: Room code '${roomCode}' does not exist.`);
      return;
    }
    else if (GameList[roomCode].gameIsStarted) {
      console.log('game has already started. cannot join');
      socket.emit('errorMsg', 'Error: Cannot join a game that has already started');
      return;
    }
    else if (name.length < 1 || name.length > 20) {
      console.log(`Name does not meet length requirements: ${name}`);
      socket.emit('errorMsg', `Error: Name must be between 1-20 characters: ${name}`);
      return;
    }
    else if (GameList[roomCode].hasPlayerWithName(name)) {
      console.log(`Error, someone already has the name: ${name}`);
      socket.emit('errorMsg', `Error: Name '${name}' is already taken.`);
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
    let errorMsg = validateOptionalCharacters(optionalCharacters, GameList[roomCode].players.length);
    if (errorMsg.length > 0) {
      socket.emit('errorMsg', errorMsg);
      return;
    }

    GameList[roomCode].gameIsStarted = true;
    GameList[roomCode].gameStage = 1;
    GameList[roomCode].initializeQuests();
    GameList[roomCode].assignIdentities(optionalCharacters);
    GameList[roomCode].assignFirstLeader();

    //update player cards
    emitSanitizedPlayers(GameList[roomCode].players);

    io.in(roomCode).emit('gameStarted');

    //quest leader chooses players to go on quest
    chooseQuestTeam(roomCode);
  });

  socket.on('addPlayerToQuest', function (name) {
    let currentQuest = GameList[roomCode].getCurrentQuest();
    GameList[roomCode].addPlayerToQuest(
      currentQuest.questNum,
      name
    );

    //update player cards
    emitSanitizedPlayers(GameList[roomCode].players);

    //get rid of results from last vote if it's still showing
    io.in(roomCode).emit('hideTeamVotes');

    //update quest message
    if (currentQuest.playersNeededLeft > 0) {
      emitLeaderIsChoosingTeam(roomCode, currentQuest);
    } else {
      io.in(roomCode).emit('updateQuestMsg',
        `Waiting for ${currentQuest.leader.name} to confirm team.`
      );
      //show confirm button to quest leader
      socket.emit('confirmQuestTeam', true);
    }
  });

  socket.on('removePlayerFromQuest', function (name) {
    let currentQuest = GameList[roomCode].getCurrentQuest();
    GameList[roomCode].removePlayerFromQuest(
      currentQuest.questNum,
      name
    );

    //update player cards
    emitSanitizedPlayers(GameList[roomCode].players);

    //update quest message
    emitLeaderIsChoosingTeam(roomCode, currentQuest);

    //hide confirm button from quest leader
    socket.emit('confirmQuestTeam', false);
  });

  socket.on('questTeamConfirmed', function () {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    //hide vote results from previous quest
    io.in(roomCode).emit('hideVotes');

    //hide confirm button from quest leader
    socket.emit('confirmQuestTeam', false);

    //hide add/remove players from quest leader
    io.to(currentQuest.leader.socketID).emit('choosePlayersForQuest', false);

    //update quest message
    io.in(roomCode).emit('updateQuestMsg', 'Waiting for all players to Accept or Reject team.');

    //show accept/reject buttons to everyone
    io.in(roomCode).emit('acceptOrRejectTeam', true);
  });

  //players vote whether they like the team or not
  socket.on('questTeamDecision', function (data) {
    let name = data.name;
    let decision = data.decision;
    let currentQuest = GameList[roomCode].getCurrentQuest();

    //make sure same player can't vote multiple times
    if (currentQuest.questTeamDecisions.voted.includes(name)) {
      return;
    }

    if (decision === 'accept') {
      currentQuest.questTeamDecisions.accept.push(name);
    } else {
      currentQuest.questTeamDecisions.reject.push(name);
    }

    currentQuest.questTeamDecisions.voted.push(name);
    console.log(`received decision from: ${name}`);

    io.in(roomCode).emit('updateQuestMsg', 'Waiting for all players to Accept or Reject team.');

    //hide buttons if they already voted
    socket.emit('acceptOrRejectTeam', false);

    //show that player has made some kind of vote
    io.in(roomCode).emit('votedOnTeam', currentQuest.questTeamDecisions.voted);

    //everyone has voted, reveal the votes & move to next step
    if (currentQuest.questTeamDecisions.voted.length === currentQuest.totalNumPlayers) {
      io.in(roomCode).emit('revealTeamVotes', currentQuest.questTeamDecisions);

      //quest Rejected
      if (currentQuest.questTeamDecisions.reject.length >= GameList[roomCode].players.length / 2) {
        questTeamRejectedStuff(roomCode, currentQuest);
      }
      //quest accepted
      else {
        questTeamAcceptedStuff(roomCode, currentQuest);
      }
    }
  });


  socket.on('questVote', function (data) {
    let name = data.name;
    let decision = data.decision;
    let currentQuest = GameList[roomCode].getCurrentQuest();
    console.log(`received quest vote from: ${name}`);

    if(decision == 'succeed') {
      currentQuest.votes.succeed++;
    }
    else {
      currentQuest.votes.fail++;
    }

    //check if number of received votes is max needed
    if((currentQuest.votes.succeed + currentQuest.votes.fail) == currentQuest.playersRequired) {
      //get rid of team vote stuff from DecideQuestTeam component
      io.in(roomCode).emit('hideTeamVotes');
      console.log('All quest votes received.');
      //show quest vote results to all players
      io.in(roomCode).emit('revealVotes', currentQuest.votes);

      if(currentQuest.votes.fail > 0) {
        currentQuest.success = false;
      }
      else {
        currentQuest.success = true;
      }
      //update Quest Cards to reveal success/fail
      io.in(roomCode).emit('updateQuests', {
        quests: GameList[roomCode].quests,
        currentQuestNum: currentQuest.questNum
      });

      //choose next leader and start next quest
      GameList[roomCode].startNextQuest(currentQuest.questNum);
      //update player cards
      emitSanitizedPlayers(GameList[roomCode].players);
      //quest leader chooses players to go on quest
      chooseQuestTeam(roomCode);
    }

  });

  //TODO: update disconnect to turn a player into a bot if the game has been started already
  socket.on('disconnect', function () {
    if (Object.keys(GameList).length != 0 && GameList[roomCode] != undefined) {
      GameList[roomCode].deletePlayer(socket.id);
      let players = GameList[roomCode].players;

      //disconnection after game start
      if (GameList[roomCode].gameIsStarted) {
        emitSanitizedPlayers(players);
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
function emitSanitizedPlayers(players) {
  for (let i in players) {
    if (players[i].character === 'Percival') {
      let sanitizedPlayers = sanitizeForPercival(players[i].socketID, players);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    } else if (players[i].character === 'Merlin') {
      let sanitizedPlayers = sanitizeForMerlin(players[i].socketID, players);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    } else if (players[i].character === 'Minion of Mordred' || players[i].character === 'Assassin' || players[i].character === 'Mordred' || players[i].character === 'Morgana') {
      let sanitizedPlayers = sanitizeForEvilTeam(players[i].socketID, players);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    } else {
      let sanitizedPlayers = sanitizeForGoodTeam(players[i].socketID, players);
      //emit sanitized player list to client, client then updates the UI
      io.to(players[i].socketID).emit('updatePlayers', {
        players: sanitizedPlayers
      });
    }
  }
}

function emitLeaderIsChoosingTeam(roomCode, currentQuest) {
  io.in(roomCode).emit('updateQuestMsg',
    `${currentQuest.leader.name} is choosing 
    ${currentQuest.playersNeededLeft} more players to go on quest 
    ${currentQuest.questNum}`
  );
}

function chooseQuestTeam(roomCode) {
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
  emitLeaderIsChoosingTeam(roomCode, currentQuest);

  //only let the quest leader choose players
  io.to(currentQuest.leader.socketID).emit('choosePlayersForQuest', true);
}

function questTeamAcceptedStuff(roomCode, currentQuest) {
  //set to empty (DecideQuestTeam shows approval message)
  io.in(roomCode).emit('updateQuestMsg', '');

  let players = GameList[roomCode].players;
  console.log("Quest team is: ");
  for (let i = 0; i < players.length; i++) {
    //send goOnQuest to each player on quest
    if(players[i].onQuest == true) {
      let onGoodTeam = (players[i].team) == "Good";
      io.to(GameList[roomCode].players[i].socketID).emit('goOnQuest', onGoodTeam);
      console.log(players[i].name);
    }
  }

}

function questTeamRejectedStuff(roomCode, currentQuest) {
  currentQuest.voteTrack++;

  //check if voteTrack has exceeded 5 (game over)
  if (currentQuest.voteTrack > 5) {
    var msg = "Quest " + currentQuest.questNum + " had 5 failed team votes.";

    GameList[roomCode].endGameEvilWins(msg);
    io.in(roomCode).emit('gameOver', msg);
  }
  else {
    //reset current quest player data
    GameList[roomCode].resetPlayersOnQuest(currentQuest.questNum);


    //choose next quest leader
    GameList[roomCode].assignNextLeader(currentQuest.questNum);

    //update player cards
    emitSanitizedPlayers(GameList[roomCode].players);

    //quest leader chooses players to go on quest
    chooseQuestTeam(roomCode);
  }
}