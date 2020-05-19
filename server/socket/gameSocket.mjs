import {
  GameList,
  updatePlayerCards
} from './appSocket.mjs';
import GameBot from '../game/gameBot.mjs';

/**
 * @param {Object} io
 * @param {Object} socket
 * @param {Number} port
 * @param {Number} roomCode
 * @param {String} playerName
 * @param {Boolean} reconnect
 */
export function gameSocket(io, socket, port, roomCode, playerName, reconnect) {
  socket.on('createBot', function () {
    const player = GameList[roomCode].players.find(player => player.socketID === socket.id);
    if (!GameList[roomCode].gameIsStarted && player.type === 'Host') {
      new GameBot(roomCode, port).startListening();
    }
  });

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
    GameList[roomCode].players.find(player => player.name === playerName).votedOnTeam = true;

    updateQuestMsg(`Waiting for ${currentQuest.teamVotesNeededLeft} more player(s) to Accept or Reject team.`);
    socket.emit('showAcceptOrRejectTeamBtns', false);

    //everyone has voted, reveal the votes & move to next step
    if (currentQuest.teamVotesNeededLeft <= 0) {
      GameList[roomCode].gameState['showAcceptOrRejectTeamBtns'] = false;
      GameList[roomCode].resetPlayersProperty('votedOnTeam');

      currentQuest.assignTeamResult();
      io.in(roomCode).emit('revealVoteStatus', { type: 'team', votes: currentQuest.acceptOrRejectTeam });
      if (currentQuest.teamAccepted) {
        incrementVoteTrackAndAssignNextLeader(currentQuest);
      } else {
        showSucceedAndFailBtnsToPlayersOnQuest();
      }
    }
  });

  /**
   * @param {Object} data 
   */
  socket.on('questVote', function (data) {
    const { playerName, decision } = data;
    let currentQuest = GameList[roomCode].getCurrentQuest();

    GameList[roomCode].players.find(player => player.name === playerName).votedOnQuest = true;
    currentQuest.addQuestVote({ decision });
    updateQuestMsg(`Waiting for ${currentQuest.questVotesNeededLeft} more player(s) to go on quest.`);

    // all votes received
    if (currentQuest.questVotesNeededLeft <= 0) {
      GameList[roomCode].gameState['showSucceedOrFailQuestBtns'] = false;
      currentQuest.assignQuestResult();
      currentQuest.success ? GameList[roomCode].questSuccesses++ : GameList[roomCode].questFails++;
      GameList[roomCode].resetPlayersProperty('votedOnQuest');

      io.in(roomCode).emit('revealVoteStatus', { type: 'quest', votes: currentQuest.votes });
      io.in(roomCode).emit('updateBotRiskScores', currentQuest);
      io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
      checkForGameOver();
    }
  });

  /**
   * @param {String} playerName 
   */
  socket.on('assassinatePlayer', function (playerName) {
    const merlinPlayer = GameList[roomCode].players.find(player => player.role === 'Merlin');
    if (merlinPlayer.team === 'Evil') return;
    console.log(`\nMerlin is: ${merlinPlayer.name} \nAttempting to assassinate: ${playerName}.`);
    socket.emit('showAssassinateBtn', false);

    let msg;
    if (merlinPlayer.name === playerName) {
      GameList[roomCode].winningTeam = 'evil';
      msg = `Assassin successfully discovered and killed ${playerName}, who was Merlin. Evil Wins!`;
    } else {
      GameList[roomCode].winningTeam = 'good';
      msg = `Assassin killed ${playerName}, who is not Merlin. Good Wins!`;
    }
    updateQuestMsg(msg);
    io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
  });

  socket.on('disconnect', function () {
    if (Object.keys(GameList).length === 0 || typeof GameList[roomCode] === 'undefined') return;

    const spectator = GameList[roomCode].spectators.find(spectator => spectator.socketID === socket.id);
    if (spectator) {
      GameList[roomCode].deletePersonFrom({ arrayName: 'spectators', socketID: socket.id });
      io.in(roomCode).emit('updateSpectatorsList', GameList[roomCode].spectators);
      updateServerChatMsg(`${spectator.name} has stopped spectating the game.`);
      return;
    }

    let player = GameList[roomCode].players.find(player => player.socketID === socket.id);
    if (GameList[roomCode].gameIsStarted) player.disconnected = true;
    else GameList[roomCode].deletePersonFrom({ arrayName: 'players', socketID: socket.id });
    updateServerChatMsg(`${player.name} has disconnected.`);

    if (!GameList[roomCode].gameIsStarted && player.type === 'Host' && GameList[roomCode].players.length > 0) {
      const newHost = GameList[roomCode].assignNextHost();
      io.to(newHost.socketID).emit('showSetupOptionsBtn', true);
      updateServerChatMsg(`${newHost.name} has become the new host.`);
      if (GameList[roomCode].players.length >= 5) io.to(newHost.socketID).emit('showStartGameBtn');
    }

    if (GameList[roomCode].winningTeam !== null) io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    else updatePlayerCards(io, GameList[roomCode].players, GameList[roomCode].spectators);
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
   * @param {String} msg 
   */
  function updateServerChatMsg(msg) {
    const msgObj = { id: Date.now(), serverMsg: msg };
    GameList[roomCode].chat.push(msgObj);
    io.in(roomCode).emit('updateChat', msgObj);
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
      GameList[roomCode].winningTeam = 'evil';
      GameList[roomCode].resetPlayersProperty('onQuest');
      GameList[roomCode].quests[questNum].resetQuest();
      updateQuestMsg(`${GameList[roomCode].questFails} quests failed. Evil Wins!`);
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    }
    //good is on track to win, evil can assassinate
    else if (GameList[roomCode].questSuccesses >= 3) {
      const assassinSocketID = GameList[roomCode].players.find(player => player.role === 'Assassin').socketID;
      updateQuestMsg(`Good has triumphed over Evil by succeeding ${GameList[roomCode].questSuccesses} quests. 
                      Waiting for Assassin to attempt to assassinate Merlin.`)

      io.to(assassinSocketID).emit('updateQuestMsg', `You are the assassin. 
                                    Assassinate the player you think is Merlin to win the game for evil.`);
      io.to(assassinSocketID).emit('showAssassinateBtn', true);
    }
    else {
      //choose next leader and start next quest
      GameList[roomCode].startNextQuest(questNum);
      updatePlayerCards(io, GameList[roomCode].players, GameList[roomCode].spectators);
      leaderChoosesQuestTeam();
    }
  }

  function showSucceedAndFailBtnsToPlayersOnQuest() {
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

  if (reconnect) {
    console.log(`\nreconnecting ${playerName} to room ${roomCode}`)
    let player = GameList[roomCode].players.find(player => player.name === playerName);
    player.reconnect(socket.id);

    socket.emit('passedValidation', { playerName, roomCode });
    socket.join(roomCode);

    socket.emit('initChat', { msgs: GameList[roomCode].chat, showMsgInput: true });
    updateServerChatMsg(`${playerName} has reconnected.`);

    socket.emit('startGame');
    socket.emit('setRoleList', GameList[roomCode].roleList);
    if (GameList[roomCode].winningTeam !== null) {
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    } else {
      updatePlayerCards(io, GameList[roomCode].players, GameList[roomCode].spectators);
    }
    io.in(roomCode).emit('updateSpectatorsList', GameList[roomCode].spectators);

    let currentQuest = GameList[roomCode].getCurrentQuest();
    io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
    io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
    io.in(roomCode).emit('updateVoteTrack', currentQuest.voteTrack);

    if (GameList[roomCode].gameState['showAcceptOrRejectTeamBtns'] && !player.votedOnTeam) {
      socket.emit('showAcceptOrRejectTeamBtns', true);
    }
    else if (currentQuest.teamVotesNeededLeft <= 0) {
      io.in(roomCode).emit('revealVoteStatus', { type: 'team', votes: currentQuest.acceptOrRejectTeam });
    }
    if (GameList[roomCode].gameState['showSucceedOrFailQuestBtns']) {
      showSucceedAndFailBtnsToPlayersOnQuest();
    }
    if (currentQuest.leaderInfo.name === playerName && !currentQuest.leaderHasConfirmedTeam) {
      currentQuest.leaderInfo.socketID = socket.id;
      io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', true);
      socket.emit('showConfirmTeamBtnToLeader', false);
    }
    if (currentQuest.leaderInfo.name === playerName && currentQuest.playersNeededLeft <= 0 && !currentQuest.leaderHasConfirmedTeam) {
      socket.emit('showConfirmTeamBtnToLeader', true);
    }
    if (GameList[roomCode].questSuccesses >= 3 && GameList[roomCode].winningTeam === null && player.role === 'Assassin') {
      socket.emit('updateQuestMsg', `You are the assassin. 
                                    Assassinate the player you think is Merlin to win the game for evil.`);
      socket.emit('showAssassinateBtn', true);
    }
  }
}