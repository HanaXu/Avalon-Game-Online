import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import Game from './game/game.mjs';
import Player from './game/player.mjs';
import GameBot from './game/gameBot.mjs';
import {
  sanitizeTeamView,
  validateOptionalCharacters
} from './game/utility.mjs';

const app = express();
const port = 3000;
const server = app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
const io = socketIO(server);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(__dirname + "/dist/"));
app.get(/.*/, function (req, res) {
  res.sendFile(__dirname + "/dist/index.html");
});

var GameList = {}; //keeps record of all game objects
const requireAuth = false;

io.on('connection', socket => {
  var roomCode; //make roomCode available to socket

  socket.on('checkForAuth', function () {
    socket.emit('setAuth', requireAuth);
  });

  socket.on('createRoom', function (name) {
    //validate user input
    if (name === null || name.length < 1 || name.length > 20) {
      console.log(`Error: Name does not meet length requirements: ${name}`);
      socket.emit('updateErrorMsg', `Error: Name must be between 1-20 characters: ${name}`);
      return;
    }
    roomCode = generateRoomCode();
    socket.emit('passedValidation', {
      name: name,
      roomCode: roomCode
    });
    socket.join(roomCode); //subscribe the socket to the roomcode

    GameList[roomCode] = new Game(roomCode);
    GameList[roomCode].players.push(new Player(socket.id, name, roomCode, 'Host'));
    socket.emit('showHostSetupOptionsBtn', true);
    io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
  });

  socket.on('challengeMode', function (mode) {
    GameList[roomCode].challengeMode = mode;
    io.in(roomCode).emit('updateChallengeMode', mode);
  });

  socket.on('createBot', function (roomCode) {
    let Bot = new GameBot();
    Bot.createBot(roomCode, port);
  });

  socket.on('joinRoom', function (data) {
    roomCode = data.roomCode;
    const name = data.name;
    //reconnect disconnected player after the game has started
    if (GameList[roomCode] && GameList[roomCode].getPlayerBy('name', name) &&
      GameList[roomCode].getPlayerBy('name', name).disconnected === true) {
      reconnectPlayerToStartedGame(name);
      return;
    }
    //validate user input
    const errorMsg = validateJoinRoom(name, roomCode);
    if (errorMsg.length > 0) {
      socket.emit('updateErrorMsg', errorMsg);
      return;
    }
    socket.emit('passedValidation', {
      name: name,
      roomCode: roomCode
    });
    socket.join(roomCode);
    GameList[roomCode].players.push(new Player(socket.id, name, roomCode, 'Guest'));

    io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    io.in(roomCode).emit('updateChallengeMode', GameList[roomCode].challengeMode);
    if (GameList[roomCode].players.length >= 5) {
      const hostSocketID = GameList[roomCode].getPlayerBy('role', 'Host').socketID;
      io.to(hostSocketID).emit('showStartGameBtn');
    }
  });

  socket.on('startGame', function (data) {
    roomCode = data.roomCode;
    const optionalCharacters = data.optionalCharacters;
    const errorMsg = validateOptionalCharacters(optionalCharacters, GameList[roomCode].players.length);
    if (errorMsg.length > 0) {
      socket.emit('updateErrorMsg', errorMsg);
      return;
    }

    GameList[roomCode].startGame(optionalCharacters);
    updatePlayerCards(GameList[roomCode].players);
    io.in(roomCode).emit('startGame');
    io.to(socket.id).emit('showHostSetupOptionsBtn', false);
    io.in(roomCode).emit('setRoleList', {
      good: GameList[roomCode].roleList["good"],
      evil: GameList[roomCode].roleList["evil"]
    });
    //empty the history modal in case player is still in same session from a previous game
    io.in(roomCode).emit('updateHistoryModal', []);
    leaderChoosesQuestTeam(roomCode);
  });

  socket.on('addPlayerToQuest', function (name) {
    let currentQuest = GameList[roomCode].getCurrentQuest();
    GameList[roomCode].addPlayerToQuest(currentQuest.questNum, name);
    updatePlayerCards(GameList[roomCode].players);

    if (currentQuest.playersNeededLeft > 0) {
      updateLeaderIsChoosingPlayersMsg(roomCode, currentQuest);
    } else {
      updateQuestMsg(roomCode, `Waiting for ${currentQuest.leaderInfo.name} to confirm team.`);
      socket.emit('showConfirmTeamBtnToLeader', true);
    }
  });

  socket.on('removePlayerFromQuest', function (name) {
    let currentQuest = GameList[roomCode].getCurrentQuest();
    GameList[roomCode].removePlayerFromQuest(currentQuest.questNum, name);
    updatePlayerCards(GameList[roomCode].players);
    updateLeaderIsChoosingPlayersMsg(roomCode, currentQuest);
    socket.emit('showConfirmTeamBtnToLeader', false);
  });

  socket.on('leaderHasConfirmedTeam', function () {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    io.in(roomCode).emit('hidePreviousQuestVotes');
    socket.emit('showConfirmTeamBtnToLeader', false);
    io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', {
      bool: false,
      players: GameList[roomCode].players,
      currentQuestNum: currentQuest.questNum
    });
    currentQuest.leaderHasConfirmedTeam = true;

    GameList[roomCode].gameState['acceptOrRejectTeam'] = true;
    updateQuestMsg(roomCode, 'Waiting for all players to Accept or Reject team.');
    io.in(roomCode).emit('showAcceptOrRejectTeamBtns', {
      bool: true,
      onQuest: Array.from(currentQuest.playersOnQuest),
      players: GameList[roomCode].players
    });
  });

  socket.on('playerAcceptsOrRejectsTeam', function (data) {
    const { name, decision } = data;
    let currentQuest = GameList[roomCode].getCurrentQuest();
    currentQuest.acceptOrRejectTeam[decision].push(name);
    currentQuest.acceptOrRejectTeam.voted.push(name);
    GameList[roomCode].getPlayerBy('name', name).votedOnTeam = true;

    updateQuestMsg(roomCode, 'Waiting for all players to Accept or Reject team.');
    socket.emit('showAcceptOrRejectTeamBtns', { bool: false });
    io.in(roomCode).emit('updateConcealedTeamVotes', currentQuest.acceptOrRejectTeam.voted);

    //everyone has voted, reveal the votes & move to next step
    if (currentQuest.acceptOrRejectTeam.voted.length === currentQuest.totalNumPlayers) {
      GameList[roomCode].gameState['acceptOrRejectTeam'] = false;
      GameList[roomCode].resetPlayersProperty('votedOnTeam');
      const teamIsRejected = currentQuest.acceptOrRejectTeam.reject.length >= GameList[roomCode].players.length / 2;
      teamIsRejected ? currentQuest.acceptOrRejectTeam.result = 'rejected' : currentQuest.acceptOrRejectTeam.result = 'accepted';

      io.in(roomCode).emit('revealTeamVotes', currentQuest.acceptOrRejectTeam);
      teamIsRejected ? questTeamRejectedStuff(roomCode, currentQuest) : questTeamAcceptedStuff(roomCode);
    }
  });

  socket.on('questVote', function (data) {
    const { name, decision } = data;
    GameList[roomCode].getPlayerBy('name', name).votedOnQuest = true;
    console.log(`received quest vote from: ${name}`);

    let currentQuest = GameList[roomCode].getCurrentQuest();
    const votes = currentQuest.votes;
    votes[decision] += 1;
    votes.voted.push(name);
    io.in(roomCode).emit('updateConcealedQuestVotes', votes.voted); //show that player has made some kind of vote

    //check if number of received votes is max needed
    if ((votes.succeed + votes.fail) == currentQuest.playersRequired) {
      GameList[roomCode].gameState['succeedOrFailQuest'] = false;

      console.log('All quest votes received.');
      currentQuest.assignResult();
      io.in(roomCode).emit('hidePreviousTeamVotes');
      io.in(roomCode).emit('revealQuestResults', votes);
      GameList[roomCode].saveQuestHistory(currentQuest);

      if (GameList[roomCode].challengeMode === "OFF") {
        io.in(roomCode).emit('updateHistoryModal', GameList[roomCode].questHistory);
      }
      io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
      GameList[roomCode].resetPlayersProperty('votedOnQuest');
      checkForGameOver(roomCode);
    }
  });

  socket.on('assassinatePlayer', function (name) {
    const merlinPlayer = GameList[roomCode].getPlayerBy('character', 'Merlin');
    console.log(`Merlin is: ${merlinPlayer.name} \nAttempting to assassinate: ${name}.`);
    const msg = merlinPlayer.name === name ? `Assassin successfully discovered and killed ${name}, who was Merlin. Evil Wins!`
      : `Assassin failed to discover and kill Merlin. Good Wins!`;
    io.in(roomCode).emit('gameOver', msg);
  });

  socket.on('disconnect', function () {
    if (Object.keys(GameList).length != 0 && typeof GameList[roomCode] !== 'undefined') {
      let players = GameList[roomCode].players;
      //disconnection after game start
      if (GameList[roomCode].gameIsStarted) {
        console.log('disconnecting player from started game')
        GameList[roomCode].getPlayerBy('socketID', socket.id).disconnected = true;
        updatePlayerCards(players);
      }
      //disconnection before game start
      else {
        GameList[roomCode].deletePlayer(socket.id);
        io.in(roomCode).emit('updatePlayerCards', players);
      }
    }
  });

  function reconnectPlayerToStartedGame(name) {
    console.log(`reconnecting ${name} to room ${roomCode}`)
    let existingPlayer = GameList[roomCode].getPlayerBy('name', name);
    existingPlayer.socketID = socket.id;
    existingPlayer.disconnected = false;

    socket.emit('passedValidation', {
      name: name,
      roomCode: roomCode
    });
    socket.join(roomCode);

    //show game screen instead of lobby
    if (GameList[roomCode].gameIsStarted) {
      socket.emit('startGame');
      io.in(roomCode).emit('setRoleList', {
        good: GameList[roomCode].roleList["good"],
        evil: GameList[roomCode].roleList["evil"]
      });
    }
    updatePlayerCards(GameList[roomCode].players);

    let currentQuest = GameList[roomCode].getCurrentQuest();
    io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
    io.in(roomCode).emit('updateVoteTrack', currentQuest.voteTrack);
    io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
    if (GameList[roomCode].challengeMode === "OFF") {
      io.in(roomCode).emit('updateHistoryModal', GameList[roomCode].questHistory);
    }

    if (GameList[roomCode].gameState['acceptOrRejectTeam'] === true) {
      io.in(roomCode).emit('updateConcealedTeamVotes', currentQuest.acceptOrRejectTeam.voted);
      if (!existingPlayer.votedOnTeam) {
        console.log('did not vote yet, showing accept/reject buttons')
        socket.emit('showAcceptOrRejectTeamBtns', { bool: true });
      }
    }
    //reveal votes
    else if (currentQuest.acceptOrRejectTeam.voted.length === currentQuest.totalNumPlayers) {
      console.log('reveal votes');
      //client does not seem to be getting revealAcceptOrRejectTeam
      io.in(roomCode).emit('revealAcceptOrRejectTeam', currentQuest.acceptOrRejectTeam);
    }

    if (GameList[roomCode].gameState['succeedOrFailQuest'] === true) {
      questTeamAcceptedStuff(roomCode);
    }
    if (currentQuest.leaderInfo.name === name && !currentQuest.leaderHasConfirmedTeam) {
      console.log('showing add/remove quest buttons to leader')
      currentQuest.leaderInfo.socketID = socket.id;
      io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', {
        bool: true,
        players: GameList[roomCode].players,
        currentQuestNum: currentQuest.questNum
      });
      socket.emit('showConfirmTeamBtnToLeader', false);
    }
    if (currentQuest.leaderInfo.name === name && currentQuest.playersNeededLeft <= 0 && !currentQuest.leaderHasConfirmedTeam) {
      socket.emit('showConfirmTeamBtnToLeader', true);
    }
  }
});

function generateRoomCode() {
  let roomCode = Math.floor(Math.random() * 999999) + 1;
  //check if the room already exists
  while (GameList.hasOwnProperty(roomCode)) {
    console.log(`collision with roomCode ${roomCode}`)
    roomCode = Math.floor(Math.random() * 999999) + 1;
  }
  console.log(`generating new room code ${roomCode}`)
  return roomCode;
}

//validate before letting player join a room
function validateJoinRoom(name, roomCode) {
  if (typeof GameList[roomCode] === 'undefined') {
    console.log(`Error: Room code '${roomCode}' does not exist.`);
    return `Error: Room code '${roomCode}' does not exist.`;
  }
  else if (GameList[roomCode].gameIsStarted) {
    console.log('Error: Cannot join a game that has already started');
    return 'Error: Cannot join a game that has already started';
  } else if (name === null || name.length < 1 || name.length > 20) {
    console.log(`Error: Name must be between 1-20 characters: ${name}`);
    return `Error: Name must be between 1-20 characters: ${name}`;
  } else if (GameList[roomCode].getPlayerBy('name', name)) {
    console.log(`Error: Name '${name}' is already taken.`);
    return `Error: Name '${name}' is already taken.`;
  } else if (GameList[roomCode].players.length >= 10) {
    console.log(`Error: Room '${roomCode}' has reached a capacity of 10`);
    return `Error: Room '${roomCode}' has reached a capacity of 10`;
  }
  else {
    return "";
  }
}

function updatePlayerCards(players) {
  players.forEach(player => {
    const sanitizedPlayers = sanitizeTeamView(player.socketID, player.character, players);
    io.to(player.socketID).emit('updatePlayerCards', sanitizedPlayers);
  });
}

function updateLeaderIsChoosingPlayersMsg(roomCode, currentQuest) {
  GameList[roomCode].gameState['questMsg'] = `${currentQuest.leaderInfo.name} is choosing 
                                              ${currentQuest.playersNeededLeft} more players to go on quest 
                                              ${currentQuest.questNum}`;
  io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
}

function updateQuestMsg(roomCode, msg) {
  GameList[roomCode].gameState['questMsg'] = msg;
  io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
}

function leaderChoosesQuestTeam(roomCode) {
  const currentQuest = GameList[roomCode].getCurrentQuest();

  io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
  io.in(roomCode).emit('updateVoteTrack', currentQuest.voteTrack);
  updateLeaderIsChoosingPlayersMsg(roomCode, currentQuest);
  console.log(`Current Quest: ${currentQuest.questNum}`);
  io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', {
    bool: true,
    players: GameList[roomCode].players,
    currentQuestNum: currentQuest.questNum
  });
}

function questTeamAcceptedStuff(roomCode) {
  updateQuestMsg(roomCode, 'Quest team was Approved. Waiting for quest team to go on quest.');
  GameList[roomCode].gameState['acceptOrRejectTeam'] = false;
  GameList[roomCode].gameState['succeedOrFailQuest'] = true;
  GameList[roomCode].players.forEach(player => {
    if (player.onQuest && !player.votedOnQuest) {
      const disableFailBtn = player.team === "Good"; //check if player is good so they can't fail quest
      io.to(player.socketID).emit('goOnQuest', disableFailBtn);
    }
  });
}

function questTeamRejectedStuff(roomCode, currentQuest) {
  GameList[roomCode].saveQuestHistory(currentQuest);
  currentQuest.voteTrack++;
  if (GameList[roomCode].challengeMode === "OFF") {
    io.in(roomCode).emit('updateHistoryModal', GameList[roomCode].questHistory);
  }
  updateQuestMsg(roomCode, 'Quest team was Rejected. New quest leader has been chosen.');

  //check if voteTrack has exceeded 5 (game over)
  if (currentQuest.voteTrack > 5) {
    io.in(roomCode).emit('gameOver', `Quest ${currentQuest.questNum} had 5 failed team votes. Evil Wins!`);
  } else { //assign next leader
    GameList[roomCode].resetPlayersProperty('onQuest');
    GameList[roomCode].quests[currentQuest.questNum].resetQuest();
    GameList[roomCode].assignNextLeader(currentQuest.questNum);
    updatePlayerCards(GameList[roomCode].players);
    leaderChoosesQuestTeam(roomCode);
  }
}

function checkForGameOver(roomCode) {
  const { questNum } = GameList[roomCode].getCurrentQuest();
  const questScores = GameList[roomCode].tallyQuestScores();

  //evil has won, game over
  if (questScores.fails >= 3) {
    GameList[roomCode].resetPlayersProperty('onQuest');
    GameList[roomCode].quests[questNum].resetQuest();
    io.in(roomCode).emit('gameOver', `${questScores.fails} quests failed. Evil Wins!`);
  }
  //good is on track to win, evil can assassinate
  else if (questScores.successes >= 3) {
    const assassinSocketID = GameList[roomCode].getPlayerBy('character', 'Assassin').socketID;
    io.in(roomCode).emit('updateQuestMsg', `Good has triumphed over Evil by succeeding 
    ${questScores.successes} quests. Waiting for Assassin to attempt to assassinate Merlin.`);

    io.to(assassinSocketID).emit('beginAssassination', `You are the assassin. 
    Choose the player you think is Merlin to attempt to assassinate them and win the game for Evil.`);
  }
  else {
    //choose next leader and start next quest
    GameList[roomCode].startNextQuest(questNum);
    updatePlayerCards(GameList[roomCode].players);
    leaderChoosesQuestTeam(roomCode);
  }
}