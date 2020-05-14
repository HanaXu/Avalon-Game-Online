import {
  GameList,
  updatePlayerCards
} from './appSocket.mjs';

/**
 * @param {Object} io
 * @param {Object} socket
 * @param {Number} roomCode
 */
export function gameSocket(io, socket, roomCode) {
  socket.on('updateChat', (msg) => {
    GameList[roomCode].chat.push(msg);
    io.in(roomCode).emit('updateChat', msg);
  });

  /**
   * @param {Object} optionalRoles 
   */
  socket.on('startGame', function (optionalRoles) {
    if (!validateOptionalRoles(optionalRoles, GameList[roomCode].players.length)) return;

    GameList[roomCode].startGame(optionalRoles);
    updatePlayerCards(io, GameList[roomCode].players, GameList[roomCode].spectators);
    io.in(roomCode).emit('startGame');
    io.to(socket.id).emit('showSetupOptionsBtn', false);
    io.in(roomCode).emit('setRoleList', GameList[roomCode].roleList);
    leaderChoosesQuestTeam();
  });

  /**
   * @param {String} playerName 
   */
  socket.on('addPlayerToQuest', function (playerName) {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    if (!GameList[roomCode].addPlayerToQuest(currentQuest.questNum, playerName)) return;
    updatePlayerCards(io, GameList[roomCode].players, GameList[roomCode].spectators);

    if (currentQuest.playersNeededLeft > 0) {
      updateQuestMsg(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more player(s)
                      to go on quest ${currentQuest.questNum}`);
    } else {
      updateQuestMsg(`Waiting for ${currentQuest.leaderInfo.name} to confirm team.`);
      socket.emit('showConfirmTeamBtnToLeader', true);
    }
  });

  /**
   * @param {String} playerName 
   */
  socket.on('removePlayerFromQuest', function (playerName) {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    if (!GameList[roomCode].removePlayerFromQuest(currentQuest.questNum, playerName)) return;
    updatePlayerCards(io, GameList[roomCode].players, GameList[roomCode].spectators);
    updateQuestMsg(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more player(s)
                    to go on quest ${currentQuest.questNum}`);
    socket.emit('showConfirmTeamBtnToLeader', false);
  });

  socket.on('leaderHasConfirmedTeam', function () {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    socket.emit('showConfirmTeamBtnToLeader', false);
    socket.emit('showAddRemovePlayerBtns', false);
    currentQuest.leaderHasConfirmedTeam = true;

    GameList[roomCode].gameState['showAcceptOrRejectTeamBtns'] = true;
    updateQuestMsg('Waiting for all players to Accept or Reject team.');
    io.in(roomCode).emit('hidePreviousVotes');
    GameList[roomCode].players.forEach(player => {
      io.to(player.socketID).emit('showAcceptOrRejectTeamBtns', true);
    })
  });

  /**
   * @param {Object} data 
   */
  socket.on('playerAcceptsOrRejectsTeam', function (data) {
    const { playerName, decision } = data;
    let currentQuest = GameList[roomCode].getCurrentQuest();

    currentQuest.addTeamVote({ playerName, decision });
    GameList[roomCode].getPlayerBy('name', playerName).votedOnTeam = true;

    updateQuestMsg(`Waiting for ${currentQuest.teamVotesNeededLeft} more player(s) to Accept or Reject team.`);
    socket.emit('showAcceptOrRejectTeamBtns', false);

    //everyone has voted, reveal the votes & move to next step
    if (currentQuest.teamVotesNeededLeft <= 0) {
      GameList[roomCode].gameState['showAcceptOrRejectTeamBtns'] = false;
      GameList[roomCode].resetPlayersProperty('votedOnTeam');

      currentQuest.assignTeamResult();
      io.in(roomCode).emit('revealTeamVotes', currentQuest.acceptOrRejectTeam);
      if (currentQuest.teamAccepted) {
        incrementVoteTrackAndAssignNextLeader(currentQuest);
      } else {
        showSucceedAndFailBtnsToPlayersOnQuest(io, roomCode);
      }
    }
  });

  /**
   * @param {Object} data 
   */
  socket.on('questVote', function (data) {
    const { playerName, decision } = data;
    let currentQuest = GameList[roomCode].getCurrentQuest();

    GameList[roomCode].getPlayerBy('name', playerName).votedOnQuest = true;
    currentQuest.addQuestVote({ decision });
    updateQuestMsg(`Waiting for ${currentQuest.questVotesNeededLeft} more player(s) to go on quest.`);

    // all votes received
    if (currentQuest.questVotesNeededLeft <= 0) {
      GameList[roomCode].gameState['showSucceedOrFailQuestBtns'] = false;
      currentQuest.assignQuestResult();
      currentQuest.success ? GameList[roomCode].questSuccesses++ : GameList[roomCode].questFails++;
      GameList[roomCode].resetPlayersProperty('votedOnQuest');

      io.in(roomCode).emit('revealQuestVotes', currentQuest.votes);
      io.in(roomCode).emit('updateBotRiskScores', currentQuest);
      io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
      checkForGameOver();
    }
  });

  /**
   * @param {String} playerName 
   */
  socket.on('assassinatePlayer', function (playerName) {
    const merlinPlayer = GameList[roomCode].getPlayerBy('role', 'Merlin');
    if (merlinPlayer.team === 'Evil') return;
    console.log(`\nMerlin is: ${merlinPlayer.name} \nAttempting to assassinate: ${playerName}.`);
    socket.emit('showAssassinateBtn', false);

    let msg;
    if (merlinPlayer.name === playerName) {
      msg = `Assassin successfully discovered and killed ${playerName}, who was Merlin. Evil Wins!`;
    } else {
      msg = `Assassin killed ${playerName}, who is not Merlin. Good Wins!`;
    }
    updateQuestMsg(msg);
    io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
  });

  socket.on('disconnect', function () {
    if (Object.keys(GameList).length != 0 && typeof GameList[roomCode] !== 'undefined') {
      let msg;
      const spectator = GameList[roomCode].getSpectatorBy('socketID', socket.id);
      if (spectator) {
        msg = { id: Date.now(), adminMsg: `${spectator.name} has stopped spectating the game.` };
        GameList[roomCode].removeSpectator(socket.id);
        io.in(roomCode).emit('updateSpectatorsList', GameList[roomCode].spectators);
      }
      else {
        const players = GameList[roomCode].players;
        let player = GameList[roomCode].getPlayerBy('socketID', socket.id);

        if (GameList[roomCode].gameIsStarted) {
          player.disconnected = true;
          updatePlayerCards(io, players, GameList[roomCode].spectators);
        }
        else { // player is in lobby
          GameList[roomCode].deletePlayer(socket.id);
          io.in(roomCode).emit('updatePlayerCards', players);
        }
        msg = { id: Date.now(), adminMsg: `${player.name} has left the game.` };
      }

      GameList[roomCode].chat.push(msg);
      io.in(roomCode).emit('updateChat', msg);
    }
  });

  /**
   * Make sure chosen optional roles works for number of players
   * If 5 or 6 players, cannot have more than 1 of Mordred, Oberon, and Morgana
   * @param {Object} roles 
   * @param {Number} numPlayers 
   */
  function validateOptionalRoles(roles, numPlayers) {
    const evilRoles = roles.filter((role) => role != "Percival");
    let errorMsg = "";

    if (numPlayers <= 6 && evilRoles.length > 1) {
      errorMsg = `Error: Games with 5 or 6 players can only include 1 optional evil role.
                  <br/>Please select only one, then click Start Game again.`;
    }
    else if ((numPlayers > 6 && numPlayers < 10) && evilRoles.length > 2) {
      errorMsg = `Error: Games with 7, 8, or 9 players can only include 2 optional evil roles.
                  <br/>Please select only one, then click Start Game again.`;
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
    updateQuestMsg(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more player(s)
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
  function incrementVoteTrackAndAssignNextLeader(currentQuest) {
    io.in(roomCode).emit('updateBotRiskScores', currentQuest);
    currentQuest.voteTrack++;

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
      updatePlayerCards(io, GameList[roomCode].players, GameList[roomCode].spectators);
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
      const assassinSocketID = GameList[roomCode].getPlayerBy('role', 'Assassin').socketID;
      updateQuestMsg(`Good has triumphed over Evil by succeeding ${GameList[roomCode].questSuccesses} quests. 
                      Waiting for Assassin to attempt to assassinate Merlin.`)

      io.to(assassinSocketID).emit('updateQuestMsg', `You are the assassin. 
                                    Assassinate the player you think is Merlin to win the game for Evil.`);
      io.to(assassinSocketID).emit('showAssassinateBtn', true);
    }
    else {
      //choose next leader and start next quest
      GameList[roomCode].startNextQuest(questNum);
      updatePlayerCards(io, GameList[roomCode].players, GameList[roomCode].spectators);
      leaderChoosesQuestTeam();
    }
  }
}

/**
 * @param {Object} io 
 * @param {Number} roomCode 
 */
function showSucceedAndFailBtnsToPlayersOnQuest(io, roomCode) {
  // updateQuestMsg('Waiting for quest team to go on quest.');
  GameList[roomCode].gameState['questMsg'] = 'Waiting for quest team to go on quest.';
  io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);

  GameList[roomCode].gameState['showAcceptOrRejectTeamBtns'] = false;
  GameList[roomCode].gameState['showSucceedOrFailQuestBtns'] = true;

  GameList[roomCode].players.forEach(player => {
    if (player.onQuest && !player.votedOnQuest) {
      const disableFailBtn = player.team === "Good"; //check if player is good so they can't fail quest
      io.to(player.socketID).emit('showSucceedOrFailQuestBtns', disableFailBtn);
    }
  });
}

/**
 * @param {Object} io 
 * @param {Object} socket 
 * @param {String} playerName 
 * @param {Number} roomCode 
 */
export function reconnectPlayerToStartedGame(io, socket, playerName, roomCode) {
  console.log(`\nreconnecting ${playerName} to room ${roomCode}`)
  let existingPlayer = GameList[roomCode].getPlayerBy('name', playerName);
  existingPlayer.socketID = socket.id;
  existingPlayer.disconnected = false;

  socket.emit('passedValidation', { playerName, roomCode });
  socket.join(roomCode);

  socket.emit('initChat', { msgs: GameList[roomCode].chat, showMsgInput: true });
  const msg = { id: Date.now(), adminMsg: `${playerName} has rejoined the game.` };
  GameList[roomCode].chat.push(msg);
  io.in(roomCode).emit('updateChat', msg);

  //show game instead of lobby
  if (GameList[roomCode].gameIsStarted) {
    socket.emit('startGame');
    socket.emit('setRoleList', GameList[roomCode].roleList);
  }
  updatePlayerCards(io, GameList[roomCode].players, GameList[roomCode].spectators);

  let currentQuest = GameList[roomCode].getCurrentQuest();
  io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
  io.in(roomCode).emit('updateVoteTrack', currentQuest.voteTrack);
  io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);

  if (GameList[roomCode].gameState['showAcceptOrRejectTeamBtns'] === true) {
    if (!existingPlayer.votedOnTeam) {
      socket.emit('showAcceptOrRejectTeamBtns', true);
    }
  }
  //reveal votes
  else if (currentQuest.teamVotesNeededLeft <= 0) {
    io.in(roomCode).emit('revealTeamVotes', currentQuest.acceptOrRejectTeam);
  }

  if (GameList[roomCode].gameState['showSucceedOrFailQuestBtns'] === true) {
    showSucceedAndFailBtnsToPlayersOnQuest(io, roomCode);
  }
  if (currentQuest.leaderInfo.name === playerName && !currentQuest.leaderHasConfirmedTeam) {
    currentQuest.leaderInfo.socketID = socket.id;
    io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', true);
    socket.emit('showConfirmTeamBtnToLeader', false);
  }
  if (currentQuest.leaderInfo.name === playerName && currentQuest.playersNeededLeft <= 0 && !currentQuest.leaderHasConfirmedTeam) {
    socket.emit('showConfirmTeamBtnToLeader', true);
  }
}