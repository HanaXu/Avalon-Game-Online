import { validateOptionalRoles } from './roomSocket.mjs';
import GameBot from '../game/gameBot.mjs';
import { sanitizeTeamView } from '../game/utility.mjs';

export let GameRooms = {}; //keeps record of all game objects

/**
 * @param {Object} io
 * @param {Object} socket
 * @param {number} port
 * @param {number} roomCode
 * @param {string} playerName
 * @param {boolean} reconnect
 */
export function gameSocket(io, socket, port, roomCode, playerName, reconnect) {
  let game = GameRooms[roomCode];

  socket.on('createBot', function () {
    if (!game.gameIsStarted && game.getPlayer('socketID', socket.id).type === 'Host') {
      new GameBot(roomCode, port).startListening();
    }
  });

  /**
   * @param {Object} msg
   */
  socket.on('updateChat', (msg) => {
    game.chat.push(msg);
    io.in(roomCode).emit('updateChat', msg);
  });

  /**
   * @param {Object} optionalRoles 
   */
  socket.on('startGame', function (optionalRoles) {
    const errorMsg = validateOptionalRoles(optionalRoles, game.players.length);
    if (errorMsg) return socket.emit('updateErrorMsg', errorMsg);

    game.startGame(optionalRoles);
    updatePlayerCards();
    socket.emit('showSetupOptionsBtn', false);
    socket.emit('showLobbyBtn', false);
    io.in(roomCode).emit('startGame', true);
    io.in(roomCode).emit('setRoleList', game.roleList);
    leaderChoosesQuestTeam();
  });

  /**
   * @param {string} playerName 
   */
  socket.on('addPlayerToQuest', function (playerName) {
    let currentQuest = game.getCurrentQuest();

    if (!game.addPlayerToQuest(currentQuest.questNum, playerName)) return;
    updatePlayerCards();

    if (currentQuest.playersNeededLeft > 0) {
      updateGameStatus(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more player(s)
                      to go on quest ${currentQuest.questNum}`);
    } else {
      updateGameStatus(`Waiting for ${currentQuest.leaderInfo.name} to confirm team.`);
      socket.emit('showConfirmTeamBtnToLeader', true);
    }
  });

  /**
   * @param {string} playerName 
   */
  socket.on('removePlayerFromQuest', function (playerName) {
    let currentQuest = game.getCurrentQuest();

    if (!game.removePlayerFromQuest(currentQuest.questNum, playerName)) return;
    updatePlayerCards();
    updateGameStatus(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more player(s)
                    to go on quest ${currentQuest.questNum}`);
    socket.emit('showConfirmTeamBtnToLeader', false);
  });

  socket.on('leaderHasConfirmedTeam', function () {
    let currentQuest = game.getCurrentQuest();

    socket.emit('showConfirmTeamBtnToLeader', false);
    socket.emit('showAddRemovePlayerBtns', false);
    currentQuest.leaderHasConfirmedTeam = true;

    game.gameState['showAcceptOrRejectTeamBtns'] = true;
    updateGameStatus('Waiting for all players to Accept or Reject team.');
    io.in(roomCode).emit('hidePreviousVoteResults');

    game.players.forEach(player => {
      io.to(player.socketID).emit('showAcceptOrRejectTeamBtns', true);
    })
  });

  /**
   * @param {string} decision 
   */
  socket.on('playerAcceptsOrRejectsTeam', function (decision) {
    let currentQuest = game.getCurrentQuest();

    currentQuest.addTeamVote({ playerName: game.getPlayer('socketID', socket.id).name, decision });
    game.getPlayer('socketID', socket.id).voted = true;
    socket.emit('showAcceptOrRejectTeamBtns', false);
    updateGameStatus(`Waiting for ${currentQuest.teamVotesNeededLeft} more player(s) to Accept or Reject team.`);

    //everyone has voted, reveal the votes & move to next step
    if (currentQuest.teamVotesNeededLeft <= 0) {
      game.gameState['showAcceptOrRejectTeamBtns'] = false;
      game.resetPlayersProperty('voted');
      currentQuest.assignTeamResult();
      io.in(roomCode).emit('revealVoteResults', { type: 'team', votes: currentQuest.acceptOrRejectTeam });

      if (currentQuest.teamAccepted) incrementVoteTrackAndAssignNextLeader(currentQuest);
      else showSucceedAndFailBtnsToPlayersOnQuest();
    }
  });

  /**
   * @param {string} decision 
   */
  socket.on('questVote', function (decision) {
    let currentQuest = game.getCurrentQuest();

    currentQuest.addQuestVote(decision);
    game.getPlayer('socketID', socket.id).voted = true;
    updateGameStatus(`Waiting for ${currentQuest.questVotesNeededLeft} more player(s) to go on quest.`);

    // all votes received
    if (currentQuest.questVotesNeededLeft <= 0) {
      game.gameState['showSucceedOrFailQuestBtns'] = false;
      game.incrementQuestSuccessFailCount(currentQuest.assignQuestResult());
      game.resetPlayersProperty('voted');

      io.in(roomCode).emit('revealVoteResults', { type: 'quest', votes: currentQuest.votes });
      io.in(roomCode).emit('updateBotRiskScores', currentQuest);
      io.in(roomCode).emit('updateQuestCards', game.quests);
      checkForGameOver();
    }
  });

  /**
   * @param {string} playerName 
   */
  socket.on('assassinatePlayer', function (playerName) {
    if (game.getPlayer('role', 'Merlin').team === 'Evil') return;

    game.getPlayer('name', playerName).assassinated = true;
    socket.emit('showAssassinateBtn', false);
    io.in(roomCode).emit('updatePlayerCards', game.players);

    game.winningTeam = game.getPlayer('role', 'Merlin').name === playerName ? 'Evil' : 'Good';
    if (game.winningTeam === 'Evil') {
      updateGameStatus(`Assassin successfully discovered and killed ${playerName}, who was Merlin. <br/>Evil wins!`, 'danger');
    } else {
      updateGameStatus(`Assassin killed ${playerName}, who is not Merlin. <br/>Good wins!`, 'success');
    }
    io.to(game.getPlayer('type', 'Host').socketID).emit('showLobbyBtn', true);
  });

  socket.on('disconnect', function () {
    if (Object.keys(GameRooms).length === 0 || typeof game === 'undefined') return;

    if (game.getSpectator('socketID', socket.id)) {
      updateServerChat(`${game.getSpectator('socketID', socket.id).name} has stopped spectating the game.`);
      game.deletePersonFrom({ arrayName: 'spectators', socketID: socket.id });
      io.in(roomCode).emit('updateSpectatorsList', game.spectators);
      return;
    }

    let player = game.getPlayer('socketID', socket.id);
    updateServerChat(`${player.name} has disconnected.`);
    if (game.gameIsStarted) player.disconnected = true;
    else game.deletePersonFrom({ arrayName: 'players', socketID: socket.id });
    if (game.players.length <= 5) io.in(roomCode).emit('showStartGameBtn', false);

    if (!game.gameIsStarted && player.type === 'Host' && game.players.length > 0) {
      const newHost = game.assignNextHost();
      io.to(newHost.socketID).emit('showSetupOptionsBtn', true);
      updateServerChat(`${newHost.name} has become the new host.`);
      if (game.players.length >= 5) {
        io.to(newHost.socketID).emit('showStartGameBtn', true)
      };
    }

    if (game.winningTeam !== null) io.in(roomCode).emit('updatePlayerCards', game.players);
    else updatePlayerCards();
  });

  socket.on('resetGame', function () {
    io.in(roomCode).emit('startGame', false);
    io.in(roomCode).emit('hidePreviousVoteResults');
    game.resetGame();
    updateGameStatus('');
    updatePlayerCards();

    if (game.players.length >= 5) {
      io.to(game.getPlayer('type', 'Host').socketID).emit('showStartGameBtn', true);
    }
    io.to(game.getPlayer('type', 'Host').socketID).emit('showSetupOptionsBtn', true);
  });

  function updatePlayerCards() {
    game.players.forEach(player => {
      io.to(player.socketID).emit('updatePlayerCards', sanitizeTeamView(player.socketID, player.role, game.players));
    });
    game.spectators.forEach(spectator => {
      io.to(spectator.socketID).emit('updatePlayerCards', sanitizeTeamView(spectator.socketID, 'Spectator', game.players))
    })
  }

  function leaderChoosesQuestTeam() {
    const currentQuest = game.getCurrentQuest();

    io.in(roomCode).emit('updateQuestCards', game.quests);
    io.in(roomCode).emit('updateVoteTrack', currentQuest.voteTrack);
    updateGameStatus(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more player(s)
                    to go on quest ${currentQuest.questNum}`);
    console.log(`Current Quest: ${currentQuest.questNum}`);
    io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', true);
  }

  /**
   * @param {string} msg 
   */
  function updateGameStatus(msg, variant = '') {
    game.gameState['status'] = { msg, variant };
    io.in(roomCode).emit('updateGameStatus', { msg, variant });
  }

  /**
   * @param {string} msg 
   */
  function updateServerChat(msg) {
    const msgObj = { id: Date.now(), serverMsg: msg };
    game.chat.push(msgObj);
    io.in(roomCode).emit('updateChat', msgObj);
  }

  /**
   * @param {Object} currentQuest 
   * @param {string} msg 
   */
  function incrementVoteTrackAndAssignNextLeader(currentQuest) {
    io.in(roomCode).emit('updateBotRiskScores', currentQuest);
    currentQuest.voteTrack++;

    //check if voteTrack has exceeded 5 (game over)
    if (currentQuest.voteTrack > 5) {
      updateGameStatus(`Quest ${currentQuest.questNum} had 5 failed team votes. Evil wins!`, 'danger');
      io.in(roomCode).emit('updatePlayerCards', game.players);
      io.to(game.getPlayer('type', 'Host').socketID).emit('showLobbyBtn', true);
    }
    //assign next leader
    else {
      game.resetPlayersProperty('onQuest');
      game.quests[currentQuest.questNum].resetQuest();
      game.assignNextLeader(currentQuest.questNum);
      updatePlayerCards();
      leaderChoosesQuestTeam();
    }
  }

  function checkForGameOver() {
    const { questNum } = game.getCurrentQuest();

    //evil has won, game over
    if (game.questFails >= 3) {
      game.winningTeam = 'evil';
      updateGameStatus(`${game.questFails} quests failed. Evil wins!`, 'danger');
      io.in(roomCode).emit('updatePlayerCards', game.players);
      io.to(game.getPlayer('type', 'Host').socketID).emit('showLobbyBtn', true);
    }
    //good is on track to win, evil can assassinate
    else if (game.questSuccesses >= 3) {
      updateGameStatus(`Good has triumphed over Evil by succeeding ${game.questSuccesses} quests. 
                      <br/>Waiting for Assassin to attempt to assassinate Merlin.`)

      io.to(game.getPlayer('role', 'Assassin').socketID).emit('updateGameStatus', {
        msg: `You are the assassin. <br/> Assassinate the player you think is Merlin to win the game for evil.`
      });
      io.to(game.getPlayer('role', 'Assassin').socketID).emit('showAssassinateBtn', true);
    }
    else {
      //choose next leader and start next quest
      game.startNextQuest(questNum);
      updatePlayerCards();
      leaderChoosesQuestTeam();
    }
  }

  function showSucceedAndFailBtnsToPlayersOnQuest() {
    updateGameStatus('Waiting for quest team to go on quest.');
    game.gameState['showAcceptOrRejectTeamBtns'] = false;
    game.gameState['showSucceedOrFailQuestBtns'] = true;

    game.players.forEach(player => {
      if (player.onQuest && !player.voted) {
        const disableFailBtn = player.team === "Good"; //check if player is good so they can't fail quest
        io.to(player.socketID).emit('showSucceedOrFailQuestBtns', disableFailBtn);
      }
    });
  }

  if (reconnect) {
    console.log(`\nreconnecting ${playerName} to room ${roomCode}`)
    let player = game.getPlayer('name', playerName);
    player.reconnect(socket.id);

    socket.emit('goToGame', { playerName, roomCode });
    socket.join(roomCode);
    socket.emit('initChat', { msgs: game.chat, showMsgInput: true });
    updateServerChat(`${playerName} has reconnected.`);
    socket.emit('startGame', true);
    socket.emit('setRoleList', game.roleList);

    if (game.winningTeam !== null) {
      io.in(roomCode).emit('updatePlayerCards', game.players);
      socket.emit('showLobbyBtn', true);
    } else {
      updatePlayerCards();
    }

    let currentQuest = game.getCurrentQuest();
    io.in(roomCode).emit('updateSpectatorsList', game.spectators);
    io.in(roomCode).emit('updateQuestCards', game.quests);
    io.in(roomCode).emit('updateGameStatus', game.gameState['status']);
    io.in(roomCode).emit('updateVoteTrack', currentQuest.voteTrack);

    if (game.gameState['showAcceptOrRejectTeamBtns'] && !player.voted) {
      socket.emit('showAcceptOrRejectTeamBtns', true);
    } else if (currentQuest.teamVotesNeededLeft <= 0) {
      socket.emit('revealVoteResults', { type: 'team', votes: currentQuest.acceptOrRejectTeam });
    }

    if (game.gameState['showSucceedOrFailQuestBtns'] && !player.voted) {
      showSucceedAndFailBtnsToPlayersOnQuest();
    } else if (currentQuest.questVotesNeededLeft <= 0) {
      socket.emit('revealVoteResults', { type: 'quest', votes: currentQuest.votes });
    }

    if (currentQuest.leaderInfo.name === playerName && !currentQuest.leaderHasConfirmedTeam) {
      currentQuest.leaderInfo.socketID = socket.id;
      socket.emit('showAddRemovePlayerBtns', true);
      socket.emit('showConfirmTeamBtnToLeader', false);
    }
    if (currentQuest.leaderInfo.name === playerName && currentQuest.playersNeededLeft <= 0 && !currentQuest.leaderHasConfirmedTeam) {
      socket.emit('showConfirmTeamBtnToLeader', true);
    }
    if (game.questSuccesses >= 3 && game.winningTeam === null && player.role === 'Assassin') {
      socket.emit('updateGameStatus', {
        msg: `You are the assassin. <br/> Assassinate the player you think is Merlin to win the game for evil.`
      });
      socket.emit('showAssassinateBtn', true);
    }
  }
}