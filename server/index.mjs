import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import { Game } from '../game/game.mjs';
import { Player } from '../game/player.mjs';
import { gameBot } from '../game/gameBot.mjs';
import {
  sanitizeTeamView,
  validateOptionalCharacters
} from '../game/utility.mjs';

const app = express();
const server = app.listen(80, () => {
  console.log('server running on port 80');
});

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(__dirname + "/dist/"));
app.get(/.*/, function (req, res) {
  res.sendFile(__dirname + "/dist/index.html");
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
    if (name === null || name.length < 1 || name.length > 20) {
      console.log(`Name does not meet length requirements: ${name}`);
      socket.emit('errorMsg', `Error: Name must be between 1-20 characters: ${name}`);
      return;
    }

    socket.emit('passedValidation');
    socket.emit('roomCode', roomCode);
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

    //since player is Host, show them the game setup options (bots, optional characters)
    io.to(socket.id).emit('showHostSetupOptions', true);

    //emit all the game players to client, client then updates the UI
    io.in(roomCode).emit('updatePlayers', {
      players: game.players
    });
  });

  // Listen for the Client-Host's Call to Create a Bot
  // Upon the Call, initaite an Instance of GameBot
  socket.on('createBot', function (roomCode) {
    console.log(`Server got call from Host to Create Bot for Room: ${roomCode}`);
    gameBot.createBot(roomCode);
  });

  //join an existing room
  socket.on('joinRoom', data => {
    let name = data.name;
    roomCode = data.roomCode;

    let existingPlayer = GameList[roomCode].getPlayer({ name: name });

    //validate before letting player join a room
    if (GameList[roomCode] === undefined) {
      console.log(`error joining room. room does not exist: ${roomCode}`);
      socket.emit('errorMsg', `Error: Room code '${roomCode}' does not exist.`);
      return;
    }
    else if (GameList[roomCode].hasPlayerWithName(name) && existingPlayer.disconnected === true) {
      //reconnect
      console.log(`reconnecting ${name} to room ${roomCode}`)
      existingPlayer.socketID = socket.id;
      existingPlayer.disconnected = false;

      socket.emit('roomCode', roomCode);
      socket.emit('passedValidation');
      socket.join(roomCode); //subscribe the socket to the roomcode

      //show game screen instead of lobby
      if (GameList[roomCode].gameIsStarted) {
        socket.emit('gameStarted');
      }
      //update player cards
      emitSanitizedPlayers(GameList[roomCode].players);

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

      io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
      socket.emit('test', 'testing')

      if (GameList[roomCode].gameState['acceptOrRejectTeam'] === true) {
        //show that player has made some kind of vote
        io.in(roomCode).emit('togglePlayerVoteStatus', true); //goes to Game.vue to display the element
        io.in(roomCode).emit('votedOnTeam', currentQuest.questTeamDecisions.voted); //goes to PlayerVoteStatus to update content of element

        if (!existingPlayer.votedOnTeam) {
          socket.emit('acceptOrRejectTeam', true);
        }
      }
      //reveal votes
      if (currentQuest.questTeamDecisions.voted.length === currentQuest.totalNumPlayers) {
        console.log('reveal votes');
        //client does not seem to be getting revealTeamVotes
        io.in(roomCode).emit('revealTeamVotes', currentQuest.questTeamDecisions);
      }

      if (GameList[roomCode].gameState['succeedOrFailQuest'] === true) {
        questTeamAcceptedStuff(roomCode);
      }
      //show add/remove quest buttons if leader
      if (currentQuest.leader.name === name && !currentQuest.questTeamConfirmed) {
        currentQuest.leader.socketID = socket.id;
        io.to(currentQuest.leader.socketID).emit('choosePlayersForQuest', true);
        socket.emit('confirmQuestTeam', false);
      }
      if (currentQuest.leader.name === name && currentQuest.playersNeededLeft <= 0) {
        //show confirm button to quest leader
        socket.emit('confirmQuestTeam', true);
      }
      return;
    }
    else if (GameList[roomCode].gameIsStarted) {
      console.log('game has already started. cannot join');
      socket.emit('errorMsg', 'Error: Cannot join a game that has already started');
      return;
    }
    else if (name === null || name.length < 1 || name.length > 20) {
      console.log(`Name does not meet length requirements: ${name}`);
      socket.emit('errorMsg', `Error: Name must be between 1-20 characters: ${name}`);
      return;
    }
    else if (GameList[roomCode].hasPlayerWithName(name)) {
      console.log(`Error, someone already has the name: ${name}`);
      socket.emit('errorMsg', `Error: Name '${name}' is already taken.`);
      return;
    }
    else if (GameList[roomCode].players.length >= 10) {
      console.log(`Error, Game is full`);
      socket.emit('errorMsg', `Error: Room '${roomCode}' has reached a capacity of 10`);
      return;
    }

    socket.emit('passedValidation');
    socket.emit('roomCode', roomCode);

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
    GameList[roomCode].initializeQuests();
    GameList[roomCode].assignIdentities(optionalCharacters);
    GameList[roomCode].assignFirstLeader();

    //update player cards
    emitSanitizedPlayers(GameList[roomCode].players);

    io.in(roomCode).emit('gameStarted');
    io.to(socket.id).emit('showHostSetupOptions', false);
    //show what kind of characters are in the game
    io.in(roomCode).emit('roleList', {
      good: GameList[roomCode].roleList["good"],
      evil: GameList[roomCode].roleList["evil"]
    });

    //empty the history modal in case player is still in same session from a previous game
    io.in(roomCode).emit('updateHistoryModal', []);

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
      GameList[roomCode].gameState['questMsg'] = `Waiting for ${currentQuest.leader.name} to confirm team.`;
      io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
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
    currentQuest.questTeamConfirmed = true;

    //update quest message
    GameList[roomCode].gameState['questMsg'] = 'Waiting for all players to Accept or Reject team.';
    io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);

    //show accept/reject buttons to everyone
    io.in(roomCode).emit('acceptOrRejectTeam', true);
    GameList[roomCode].gameState['acceptOrRejectTeam'] = true;
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

    GameList[roomCode].gameState['questMsg'] = 'Waiting for all players to Accept or Reject team.';
    io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);

    //hide buttons if they already voted
    socket.emit('acceptOrRejectTeam', false);
    GameList[roomCode].getPlayer({ name: name }).votedOnTeam = true;

    //show that player has made some kind of vote
    io.in(roomCode).emit('togglePlayerVoteStatus', true); //goes to Game.vue to display the element
    io.in(roomCode).emit('votedOnTeam', currentQuest.questTeamDecisions.voted); //goes to PlayerVoteStatus to update content of element

    //everyone has voted, reveal the votes & move to next step
    if (currentQuest.questTeamDecisions.voted.length === currentQuest.totalNumPlayers) {
      GameList[roomCode].gameState['acceptOrRejectTeam'] = false;
      GameList[roomCode].resetPlayersVotedOnTeam();
      io.in(roomCode).emit('revealTeamVotes', currentQuest.questTeamDecisions);

      //quest Rejected
      if (currentQuest.questTeamDecisions.reject.length >= GameList[roomCode].players.length / 2) {
        questTeamRejectedStuff(roomCode, currentQuest);
      }
      //quest accepted
      else {
        questTeamAcceptedStuff(roomCode);
      }
    }
  });


  socket.on('questVote', function (data) {
    let name = data.name;
    let decision = data.decision;
    let currentQuest = GameList[roomCode].getCurrentQuest();
    console.log(`received quest vote from: ${name}`);

    GameList[roomCode].getPlayer({ name: name }).votedOnQuest = true;
    let votes = currentQuest.votes;

    if (decision == 'succeed') {
      votes.succeed.push(name);
    }
    else {
      votes.fail.push(name);
    }

    votes.voted.push(name);
    //show that player has made some kind of vote
    io.in(roomCode).emit('votedOnQuest', votes.voted);

    //check if number of received votes is max needed
    if ((votes.succeed.length + votes.fail.length) == currentQuest.playersRequired) {
      GameList[roomCode].gameState['succeedOrFailQuest'] = false;

      //get rid of team vote stuff from DecideQuestTeam component
      io.in(roomCode).emit('hideTeamVotes');
      console.log('All quest votes received.');

      //show quest vote results to all players
      io.in(roomCode).emit('revealVotes', { success: votes.succeed.length, fail: votes.fail.length });

      currentQuest.assignResult(); //quest success or fail

      //add quest to history log
      GameList[roomCode].saveQuestHistory(currentQuest.questNum, currentQuest);
      io.in(roomCode).emit('updateHistoryModal', GameList[roomCode].questHistory);

      //update Quest Cards to reveal success/fail
      io.in(roomCode).emit('updateQuests', {
        quests: GameList[roomCode].quests,
        currentQuestNum: currentQuest.questNum
      });

      //reset voted on quest
      GameList[roomCode].resetPlayersOnQuestVote();

      //check if quest results mean game is over (3 failed or 3 succeeded quests)
      checkForGameOver(roomCode);
    }

  });

  socket.on('assassinatePlayer', function (name) {
    console.log(`Attempting to assassinate ${name}.`);
    let isMerlin = GameList[roomCode].checkIfMerlin(name)
    let msg;

    if (isMerlin) {
      GameList[roomCode].endGameEvilWins(`Assassin successfully discovered and killed ${name}, who was Merlin.`);
      msg = `Assassin successfully discovered and killed ${name}, who was Merlin. Evil Wins!`;
    } else {
      msg = `Assassin failed to discover and kill Merlin. Good Wins!`;
    }

    io.in(roomCode).emit('gameOver', msg);
  });

  //TODO: update disconnect to turn a player into a bot if the game has been started already
  socket.on('disconnect', function () {
    if (Object.keys(GameList).length != 0 && GameList[roomCode] != undefined) {

      let players = GameList[roomCode].players;

      //disconnection after game start
      if (GameList[roomCode].gameIsStarted) {
        GameList[roomCode].getPlayer({ socketID: socket.id }).disconnected = true;
        emitSanitizedPlayers(players);
      }
      //disconnection before game start
      else {
        GameList[roomCode].deletePlayer(socket.id);
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
    let sanitizedPlayers = sanitizeTeamView(players[i].socketID, players[i].character, players);
    io.to(players[i].socketID).emit('updatePlayers', {
      players: sanitizedPlayers
    });
  }
}

function emitLeaderIsChoosingTeam(roomCode, currentQuest) {
  GameList[roomCode].gameState['questMsg'] = `${currentQuest.leader.name} is choosing 
                                              ${currentQuest.playersNeededLeft} more players to go on quest 
                                              ${currentQuest.questNum}`;

  io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
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

function questTeamAcceptedStuff(roomCode) {
  GameList[roomCode].gameState['questMsg'] = 'Quest team was Approved. Waiting for quest team to go on quest.';
  io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);

  GameList[roomCode].gameState['succeedOrFailQuest'] = true;

  let players = GameList[roomCode].players;
  console.log("Quest team is: ");

  //send goOnQuest to each player on quest
  for (let i = 0; i < players.length; i++) {
    if (players[i].onQuest == true && !players[i].votedOnQuest) {
      //check if player is good so they can't fail quest
      let onGoodTeam = (players[i].team) == "Good";

      io.to(GameList[roomCode].players[i].socketID).emit('goOnQuest', onGoodTeam);
      console.log(players[i].name);
    }
  }
}

function questTeamRejectedStuff(roomCode, currentQuest) {
  //add quest to history log
  GameList[roomCode].saveQuestHistory(currentQuest.questNum, currentQuest);
  io.in(roomCode).emit('updateHistoryModal', GameList[roomCode].questHistory);
  GameList[roomCode].gameState['questMsg'] = 'Quest team was Rejected. New quest leader has been chosen.';
  io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);

  currentQuest.voteTrack++;

  //check if voteTrack has exceeded 5 (game over)
  if (currentQuest.voteTrack > 5) {
    let msg = `Quest ${currentQuest.questNum} had 5 failed team votes. Evil Wins!`;

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

function checkForGameOver(roomCode) {
  let currentQuest = GameList[roomCode].getCurrentQuest();
  let tallyQuests = GameList[roomCode].tallyQuests();

  console.log(`tally quests success: ${tallyQuests.successes}`)
  console.log(`tally quests fails: ${tallyQuests.fails}`)

  //evil has won, game over
  if (tallyQuests.fails >= 3) {
    GameList[roomCode].resetPlayersOnQuest(currentQuest.questNum);
    io.in(roomCode).emit('gameOver', `${tallyQuests.fails} quests failed. Evil Wins!`);
  }
  //good is on track to win, evil can assassinate
  else if (tallyQuests.successes >= 3) {
    let assassinSocketID = GameList[roomCode].getAssassinSocketID();

    io.in(roomCode).emit('waitForAssassin', `Good has triumphed over Evil by succeeding 
    ${tallyQuests.successes} quests. Waiting for Assassin to attempt to assassinate Merlin.`);

    io.to(assassinSocketID).emit('beginAssassination', `You are the assassin. 
    Choose the player you think is Merlin to attempt to assassinate them and win the game for Evil.`);
  }
  //there have not been 3 successes or fails yet, continue to next quest
  else {
    //choose next leader and start next quest
    GameList[roomCode].startNextQuest(currentQuest.questNum);
    //update player cards
    emitSanitizedPlayers(GameList[roomCode].players);
    //quest leader chooses players to go on quest
    chooseQuestTeam(roomCode);
  }
}