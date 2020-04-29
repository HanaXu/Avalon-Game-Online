import {
  GameList,
  updatePlayerCards
} from '../index.mjs';

/**
 * @param {Object} io
 * @param {Object} socket
 * @param {Number} roomCode
 */
export function gameListener(io, socket, roomCode) {
  socket.on('updateChat', (msg) => {
    GameList[roomCode].chat.push(msg);
    io.in(roomCode).emit('updateChat', msg);
  });

  /**
   * @param {Object} optionalCharacters 
   */
  socket.on('startGame', function (optionalCharacters) {
    if (!validateOptionalCharacters(optionalCharacters, GameList[roomCode].players.length)) return;

    GameList[roomCode].startGame(optionalCharacters);
    updatePlayerCards(io, GameList[roomCode].players);
    io.in(roomCode).emit('startGame');
    io.to(socket.id).emit('showSetupOptionsBtn', false);
    io.in(roomCode).emit('setRoleList', GameList[roomCode].roleList);
    leaderChoosesQuestTeam();
  });

  /**
   * @param {String} name 
   */
  socket.on('addPlayerToQuest', function (name) {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    GameList[roomCode].addPlayerToQuest(currentQuest.questNum, name);
    updatePlayerCards(io, GameList[roomCode].players);

    if (currentQuest.playersNeededLeft > 0) {
      updateQuestMsg(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more players
                      to go on quest ${currentQuest.questNum}`);
    } else {
      updateQuestMsg(`Waiting for ${currentQuest.leaderInfo.name} to confirm team.`);
      socket.emit('showConfirmTeamBtnToLeader', true);
    }
  });

  /**
   * @param {String} name 
   */
  socket.on('removePlayerFromQuest', function (name) {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    GameList[roomCode].removePlayerFromQuest(currentQuest.questNum, name);
    updatePlayerCards(io, GameList[roomCode].players);
    updateQuestMsg(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more players
                    to go on quest ${currentQuest.questNum}`);
    socket.emit('showConfirmTeamBtnToLeader', false);
  });

  socket.on('leaderHasConfirmedTeam', function () {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    io.in(roomCode).emit('hidePreviousQuestVotes');
    socket.emit('showConfirmTeamBtnToLeader', false);
    socket.emit('showAddRemovePlayerBtns', false);
    currentQuest.leaderHasConfirmedTeam = true;

    GameList[roomCode].gameState['acceptOrRejectTeam'] = true;
    updateQuestMsg('Waiting for all players to Accept or Reject team.');
    io.in(roomCode).emit('showAcceptOrRejectTeamBtns', true);
  });

  /**
   * @param {Object} data 
   */
  socket.on('playerAcceptsOrRejectsTeam', function (data) {
    const { name, decision } = data;
    let currentQuest = GameList[roomCode].getCurrentQuest();

    currentQuest.addTeamVote(name, decision);
    GameList[roomCode].getPlayerBy('name', name).votedOnTeam = true;

    updateQuestMsg('Waiting for all players to Accept or Reject team.');
    socket.emit('showAcceptOrRejectTeamBtns', false);
    io.in(roomCode).emit('updateConcealedTeamVotes', currentQuest.acceptOrRejectTeam.voted);

    //everyone has voted, reveal the votes & move to next step
    if (currentQuest.acceptOrRejectTeam.voted.length === GameList[roomCode].players.length) {
      GameList[roomCode].gameState['acceptOrRejectTeam'] = false;
      GameList[roomCode].resetPlayersProperty('votedOnTeam');

      currentQuest.assignTeamResult(GameList[roomCode].players.length);
      if (currentQuest.teamAccepted) {
        incrementVoteTrackAndAssignNextLeader(currentQuest, `Quest team was rejected. Assigning next leader.`);
      } else {
        showSucceedAndFailBtnsToPlayersOnQuest(io, roomCode);
      }
      io.in(roomCode).emit('revealTeamVotes', currentQuest.acceptOrRejectTeam);
    }
  });

  /**
   * @param {Object} data 
   */
  socket.on('questVote', function (data) {
    const { name, decision } = data;
    let currentQuest = GameList[roomCode].getCurrentQuest();

    GameList[roomCode].getPlayerBy('name', name).votedOnQuest = true;
    currentQuest.addQuestVote(name, decision);
    const { voted, succeed, fail } = currentQuest.votes;
    io.in(roomCode).emit('updateConcealedQuestVotes', voted); //show that player has made some kind of vote

    // all votes received
    if ((succeed + fail) == currentQuest.teamSize) {
      GameList[roomCode].gameState['succeedOrFailQuest'] = false;
      currentQuest.assignQuestResult();
      currentQuest.success ? GameList[roomCode].questSuccesses++ : GameList[roomCode].questFails++;
      GameList[roomCode].resetPlayersProperty('votedOnQuest');

      io.in(roomCode).emit('hidePreviousTeamVotes');
      io.in(roomCode).emit('revealQuestResults', currentQuest.votes);
      io.in(roomCode).emit('updateBotRiskScores', currentQuest);
      io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
      checkForGameOver();
    }
  });

  /**
   * @param {String} name 
   */
  socket.on('assassinatePlayer', function (name) {
    const merlinPlayer = GameList[roomCode].getPlayerBy('character', 'Merlin');
    console.log(`\nMerlin is: ${merlinPlayer.name} \nAttempting to assassinate: ${name}.`);

    const msg = merlinPlayer.name === name ? `Assassin successfully discovered and killed ${name}, who was Merlin. Evil Wins!`
      : `Assassin failed to discover and kill Merlin. Good Wins!`;
    updateQuestMsg(msg);
    io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
  });

  socket.on('disconnect', function () {
    if (Object.keys(GameList).length != 0 && typeof GameList[roomCode] !== 'undefined') {
      const players = GameList[roomCode].players;
      let player = GameList[roomCode].getPlayerBy('socketID', socket.id);

      if (GameList[roomCode].gameIsStarted) {
        player.disconnected = true;
        updatePlayerCards(io, players);
      }
      else { // player is in lobby
        GameList[roomCode].deletePlayer(socket.id);
        io.in(roomCode).emit('updatePlayerCards', players);
      }

      const msg = { id: Date.now(), adminMsg: `${player.name} has left the game.` };
      GameList[roomCode].chat.push(msg);
      io.in(roomCode).emit('updateChat', msg);
    }
  });

  /**
   * Make sure chosen optional characters works for number of players
   * If 5 or 6 players, cannot have more than 1 of Mordred, Oberon, and Morgana
   * @param {Object} characters 
   * @param {Number} numPlayers 
   */
  function validateOptionalCharacters(characters, numPlayers) {
    const evilCharacters = characters.filter((character) => character != "Percival");
    let errorMsg = "";

    if (numPlayers <= 6 && evilCharacters.length > 1) {
      errorMsg = `Error: game with 5 or 6 players can only include 1 of Mordred, 
                    Oberon, or Morgana. Please select only one then click Start Game again.`;
    }
    else if ((numPlayers > 6 && numPlayers < 10) && evilCharacters.length > 2) {
      errorMsg = `Error: game with 7, 8, or 9 players can only include 2 of Mordred, 
                  Oberon, or Morgana. Please de-select one then click Start Game again.`;
    }
    if (errorMsg.length > 0) {
      socket.emit('updateErrorMsg', errorMsg);
      return false;
    }
    return true;
  }

  function leaderChoosesQuestTeam() {
    const currentQuest = GameList[roomCode].getCurrentQuest();

    io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
    io.in(roomCode).emit('updateVoteTrack', currentQuest.voteTrack);
    updateQuestMsg(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more players
                    to go on quest ${currentQuest.questNum}`);
    console.log(`Current Quest: ${currentQuest.questNum}`);
    io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', true);
  }

  /**
   * @param {String} msg 
   */
  function updateQuestMsg(msg) {
    GameList[roomCode].gameState['questMsg'] = msg;
    io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
  }

  /**
   * @param {Object} currentQuest 
   * @param {String} msg 
   */
  function incrementVoteTrackAndAssignNextLeader(currentQuest, msg) {
    io.in(roomCode).emit('updateBotRiskScores', currentQuest);
    currentQuest.voteTrack++;
    updateQuestMsg(msg);

    //check if voteTrack has exceeded 5 (game over)
    if (currentQuest.voteTrack > 5) {
      updateQuestMsg(`Quest ${currentQuest.questNum} had 5 failed team votes. Evil Wins!`);
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    }
    //assign next leader
    else {
      GameList[roomCode].resetPlayersProperty('onQuest');
      GameList[roomCode].quests[currentQuest.questNum].resetQuest();
      GameList[roomCode].assignNextLeader(currentQuest.questNum);
      updatePlayerCards(io, GameList[roomCode].players);
      leaderChoosesQuestTeam();
    }
  }

  function checkForGameOver() {
    const { questNum } = GameList[roomCode].getCurrentQuest();

    //evil has won, game over
    if (GameList[roomCode].questFails >= 3) {
      GameList[roomCode].resetPlayersProperty('onQuest');
      GameList[roomCode].quests[questNum].resetQuest();
      updateQuestMsg(`${GameList[roomCode].questFails} quests failed. Evil Wins!`);
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    }
    //good is on track to win, evil can assassinate
    else if (GameList[roomCode].questSuccesses >= 3) {
      const assassinSocketID = GameList[roomCode].getPlayerBy('character', 'Assassin').socketID;
      updateQuestMsg(`Good has triumphed over Evil by succeeding ${GameList[roomCode].questSuccesses} quests. 
                      Waiting for Assassin to attempt to assassinate Merlin.`)

      io.to(assassinSocketID).emit('beginAssassination', `You are the assassin. 
                                    Assassinate the player you think is Merlin to win the game for Evil.`);
    }
    else {
      //choose next leader and start next quest
      GameList[roomCode].startNextQuest(questNum);
      updatePlayerCards(io, GameList[roomCode].players);
      leaderChoosesQuestTeam();
    }
  }
}

/**
 * @param {Object} io 
 * @param {Number} roomCode 
 */
function showSucceedAndFailBtnsToPlayersOnQuest(io, roomCode) {
  // updateQuestMsg('Quest team was Approved. Waiting for quest team to go on quest.');
  GameList[roomCode].gameState['questMsg'] = 'Quest team was Approved. Waiting for quest team to go on quest.';
  io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);

  GameList[roomCode].gameState['acceptOrRejectTeam'] = false;
  GameList[roomCode].gameState['succeedOrFailQuest'] = true;

  GameList[roomCode].players.forEach(player => {
    if (player.onQuest && !player.votedOnQuest) {
      const disableFailBtn = player.team === "Good"; //check if player is good so they can't fail quest
      io.to(player.socketID).emit('succeedOrFailQuest', disableFailBtn);
    }
  });
}

/**
 * @param {Object} io 
 * @param {Object} socket 
 * @param {String} name 
 * @param {Number} roomCode 
 */
export function reconnectPlayerToStartedGame(io, socket, name, roomCode) {
  console.log(`\nreconnecting ${name} to room ${roomCode}`)
  let existingPlayer = GameList[roomCode].getPlayerBy('name', name);
  existingPlayer.socketID = socket.id;
  existingPlayer.disconnected = false;

  socket.emit('passedValidation', { name, roomCode });
  socket.join(roomCode);

  socket.emit('initChat', GameList[roomCode].chat);
  const msg = { id: Date.now(), adminMsg: `${name} has rejoined the game.` };
  GameList[roomCode].chat.push(msg);
  io.in(roomCode).emit('updateChat', msg);

  //show game instead of lobby
  if (GameList[roomCode].gameIsStarted) {
    socket.emit('startGame');
    socket.emit('setRoleList', GameList[roomCode].roleList);
  }
  updatePlayerCards(io, GameList[roomCode].players);

  let currentQuest = GameList[roomCode].getCurrentQuest();
  io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
  io.in(roomCode).emit('updateVoteTrack', currentQuest.voteTrack);
  io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);

  if (GameList[roomCode].gameState['acceptOrRejectTeam'] === true) {
    io.in(roomCode).emit('updateConcealedTeamVotes', currentQuest.acceptOrRejectTeam.voted);
    if (!existingPlayer.votedOnTeam) {
      socket.emit('showAcceptOrRejectTeamBtns', true);
    }
  }
  //reveal votes
  else if (currentQuest.acceptOrRejectTeam.voted.length === GameList[roomCode].players.length) {
    io.in(roomCode).emit('revealAcceptOrRejectTeam', currentQuest.acceptOrRejectTeam);
  }

  if (GameList[roomCode].gameState['succeedOrFailQuest'] === true) {
    showSucceedAndFailBtnsToPlayersOnQuest(io, roomCode);
  }
  if (currentQuest.leaderInfo.name === name && !currentQuest.leaderHasConfirmedTeam) {
    currentQuest.leaderInfo.socketID = socket.id;
    io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', true);
    socket.emit('showConfirmTeamBtnToLeader', false);
  }
  if (currentQuest.leaderInfo.name === name && currentQuest.playersNeededLeft <= 0 && !currentQuest.leaderHasConfirmedTeam) {
    socket.emit('showConfirmTeamBtnToLeader', true);
  }
}