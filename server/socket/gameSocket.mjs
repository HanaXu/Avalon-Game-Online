import { validateOptionalRoles } from './roomSocket.mjs';
import GameBot from '../game/gameBot.mjs';
import { sanitizeTeamView } from '../game/utility.mjs';

export let GameList = {}; //keeps record of all game objects

/**
 * @param {Object} io
 * @param {Object} socket
 * @param {number} port
 * @param {number} roomCode
 * @param {string} playerName
 * @param {boolean} reconnect
 */
export function gameSocket(io, socket, port, roomCode, playerName, reconnect) {
  socket.on('createBot', function () {
    const player = GameList[roomCode].players.find(player => player.socketID === socket.id);
    if (!GameList[roomCode].gameIsStarted && player.type === 'Host') {
      new GameBot(roomCode, port).startListening();
    }
  });

  /**
   * @param {Object} msg
   */
  socket.on('updateChat', (msg) => {
    GameList[roomCode].chat.push(msg);
    io.in(roomCode).emit('updateChat', msg);
  });

  /**
   * @param {Object} optionalRoles 
   */
  socket.on('startGame', function (optionalRoles) {
    const errorMsg = validateOptionalRoles(optionalRoles, GameList[roomCode].players.length);
    if (errorMsg) {
      socket.emit('updateErrorMsg', errorMsg);
      return;
    }

    GameList[roomCode].startGame(optionalRoles);
    updatePlayerCards();
    io.in(roomCode).emit('startGame');
    io.to(socket.id).emit('showSetupOptionsBtn', false);
    io.in(roomCode).emit('setRoleList', GameList[roomCode].roleList);
    leaderChoosesQuestTeam();
  });

  /**
   * @param {string} playerName 
   */
  socket.on('addPlayerToQuest', function (playerName) {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    if (!GameList[roomCode].addPlayerToQuest(currentQuest.questNum, playerName)) return;
    updatePlayerCards();

    if (currentQuest.playersNeededLeft > 0) {
      updateStatusMsg(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more player(s)
                      to go on quest ${currentQuest.questNum}`);
    } else {
      updateStatusMsg(`Waiting for ${currentQuest.leaderInfo.name} to confirm team.`);
      socket.emit('showConfirmTeamBtnToLeader', true);
    }
  });

  /**
   * @param {string} playerName 
   */
  socket.on('removePlayerFromQuest', function (playerName) {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    if (!GameList[roomCode].removePlayerFromQuest(currentQuest.questNum, playerName)) return;
    updatePlayerCards();
    updateStatusMsg(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more player(s)
                    to go on quest ${currentQuest.questNum}`);
    socket.emit('showConfirmTeamBtnToLeader', false);
  });

  socket.on('leaderHasConfirmedTeam', function () {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    socket.emit('showConfirmTeamBtnToLeader', false);
    socket.emit('showAddRemovePlayerBtns', false);
    currentQuest.leaderHasConfirmedTeam = true;

    GameList[roomCode].gameState['showAcceptOrRejectTeamBtns'] = true;
    updateStatusMsg('Waiting for all players to Accept or Reject team.');
    io.in(roomCode).emit('hidePreviousVoteResults');

    GameList[roomCode].players.forEach(player => {
      io.to(player.socketID).emit('showAcceptOrRejectTeamBtns', true);
    })
  });

  /**
   * @param {string} decision 
   */
  socket.on('playerAcceptsOrRejectsTeam', function (decision) {
    let player = GameList[roomCode].players.find(player => player.socketID === socket.id);
    let currentQuest = GameList[roomCode].getCurrentQuest();

    currentQuest.addTeamVote({ playerName: player.name, decision });
    player.voted = true;
    socket.emit('showAcceptOrRejectTeamBtns', false);
    updateStatusMsg(`Waiting for ${currentQuest.teamVotesNeededLeft} more player(s) to Accept or Reject team.`);

    //everyone has voted, reveal the votes & move to next step
    if (currentQuest.teamVotesNeededLeft <= 0) {
      GameList[roomCode].gameState['showAcceptOrRejectTeamBtns'] = false;
      GameList[roomCode].resetPlayersProperty('voted');
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
    let player = GameList[roomCode].players.find(player => player.socketID === socket.id);
    let currentQuest = GameList[roomCode].getCurrentQuest();

    currentQuest.addQuestVote(decision);
    player.voted = true;
    updateStatusMsg(`Waiting for ${currentQuest.questVotesNeededLeft} more player(s) to go on quest.`);

    // all votes received
    if (currentQuest.questVotesNeededLeft <= 0) {
      GameList[roomCode].gameState['showSucceedOrFailQuestBtns'] = false;
      const questSuccessful = currentQuest.assignQuestResult();
      GameList[roomCode].incrementQuestSuccessFailCount(questSuccessful);
      GameList[roomCode].resetPlayersProperty('voted');

      io.in(roomCode).emit('revealVoteResults', { type: 'quest', votes: currentQuest.votes });
      io.in(roomCode).emit('updateBotRiskScores', currentQuest);
      io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
      checkForGameOver();
    }
  });

  /**
   * @param {string} playerName 
   */
  socket.on('assassinatePlayer', function (playerName) {
    const merlinPlayer = GameList[roomCode].players.find(player => player.role === 'Merlin');
    if (merlinPlayer.team === 'Evil') return;

    console.log(`\nMerlin is: ${merlinPlayer.name} \nAttempting to assassinate: ${playerName}.`);
    const playerToAssassinate = GameList[roomCode].players.find(player => player.name === playerName);
    playerToAssassinate.assassinated = true;
    socket.emit('showAssassinateBtn', false);
    io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);

    GameList[roomCode].winningTeam = merlinPlayer.name === playerName ? 'Evil' : 'Good';
    if (GameList[roomCode].winningTeam === 'Evil') {
      updateStatusMsg(`Assassin successfully discovered and killed ${playerName}, who was Merlin. <br/>Evil wins!`, 'danger');
    } else {
      updateStatusMsg(`Assassin killed ${playerName}, who is not Merlin. <br/>Good wins!`, 'success');
    }
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
    else updatePlayerCards();
  });

  function updatePlayerCards() {
    const players = GameList[roomCode].players;
    players.forEach(player => {
      io.to(player.socketID).emit('updatePlayerCards', sanitizeTeamView(player.socketID, player.role, players));
    });
    GameList[roomCode].spectators.forEach(spectator => {
      io.to(spectator.socketID).emit('updatePlayerCards', sanitizeTeamView(spectator.socketID, 'Spectator', players))
    })
  }

  function leaderChoosesQuestTeam() {
    const currentQuest = GameList[roomCode].getCurrentQuest();

    io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
    io.in(roomCode).emit('updateVoteTrack', currentQuest.voteTrack);
    updateStatusMsg(`${currentQuest.leaderInfo.name} is choosing ${currentQuest.playersNeededLeft} more player(s)
                    to go on quest ${currentQuest.questNum}`);
    console.log(`Current Quest: ${currentQuest.questNum}`);
    io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', true);
  }

  /**
   * @param {string} msg 
   */
  function updateStatusMsg(msg, variant = '') {
    GameList[roomCode].gameState['statusMsg'] = { msg, variant };
    io.in(roomCode).emit('updateStatusMsg', { msg, variant });
  }

  /**
   * @param {string} msg 
   */
  function updateServerChatMsg(msg) {
    const msgObj = { id: Date.now(), serverMsg: msg };
    GameList[roomCode].chat.push(msgObj);
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
      updateStatusMsg(`Quest ${currentQuest.questNum} had 5 failed team votes. <br/>Evil wins!`, 'danger');
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    }
    //assign next leader
    else {
      GameList[roomCode].resetPlayersProperty('onQuest');
      GameList[roomCode].quests[currentQuest.questNum].resetQuest();
      GameList[roomCode].assignNextLeader(currentQuest.questNum);
      updatePlayerCards();
      leaderChoosesQuestTeam();
    }
  }

  function checkForGameOver() {
    const { questNum } = GameList[roomCode].getCurrentQuest();

    //evil has won, game over
    if (GameList[roomCode].questFails >= 3) {
      GameList[roomCode].winningTeam = 'evil';
      // GameList[roomCode].resetPlayersProperty('onQuest');
      // GameList[roomCode].quests[questNum].resetQuest();
      updateStatusMsg(`${GameList[roomCode].questFails} quests failed. <br/>Evil wins!`, 'danger');
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    }
    //good is on track to win, evil can assassinate
    else if (GameList[roomCode].questSuccesses >= 3) {
      const assassinSocketID = GameList[roomCode].players.find(player => player.role === 'Assassin').socketID;
      updateStatusMsg(`Good has triumphed over Evil by succeeding ${GameList[roomCode].questSuccesses} quests. 
                      <br/>Waiting for Assassin to attempt to assassinate Merlin.`)

      io.to(assassinSocketID).emit('updateStatusMsg', {
        msg: `You are the assassin. <br/> Assassinate the player you think is Merlin to win the game for evil.`
      });
      io.to(assassinSocketID).emit('showAssassinateBtn', true);
    }
    else {
      //choose next leader and start next quest
      GameList[roomCode].startNextQuest(questNum);
      updatePlayerCards();
      leaderChoosesQuestTeam();
    }
  }

  function showSucceedAndFailBtnsToPlayersOnQuest() {
    updateStatusMsg('Waiting for quest team to go on quest.');
    GameList[roomCode].gameState['showAcceptOrRejectTeamBtns'] = false;
    GameList[roomCode].gameState['showSucceedOrFailQuestBtns'] = true;

    GameList[roomCode].players.forEach(player => {
      if (player.onQuest && !player.voted) {
        const disableFailBtn = player.team === "Good"; //check if player is good so they can't fail quest
        io.to(player.socketID).emit('showSucceedOrFailQuestBtns', disableFailBtn);
      }
    });
  }

  if (reconnect) {
    console.log(`\nreconnecting ${playerName} to room ${roomCode}`)
    let player = GameList[roomCode].players.find(player => player.name === playerName);
    player.reconnect(socket.id);

    socket.emit('goToGame', { playerName, roomCode });
    socket.join(roomCode);

    socket.emit('initChat', { msgs: GameList[roomCode].chat, showMsgInput: true });
    updateServerChatMsg(`${playerName} has reconnected.`);

    socket.emit('startGame');
    socket.emit('setRoleList', GameList[roomCode].roleList);
    if (GameList[roomCode].winningTeam !== null) {
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    } else {
      updatePlayerCards();
    }
    io.in(roomCode).emit('updateSpectatorsList', GameList[roomCode].spectators);

    let currentQuest = GameList[roomCode].getCurrentQuest();
    io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
    io.in(roomCode).emit('updateStatusMsg', GameList[roomCode].gameState['statusMsg']);
    io.in(roomCode).emit('updateVoteTrack', currentQuest.voteTrack);

    if (GameList[roomCode].gameState['showAcceptOrRejectTeamBtns'] && !player.voted) {
      socket.emit('showAcceptOrRejectTeamBtns', true);
    }
    else if (currentQuest.teamVotesNeededLeft <= 0) {
      socket.emit('revealVoteResults', { type: 'team', votes: currentQuest.acceptOrRejectTeam });
    }
    if (GameList[roomCode].gameState['showSucceedOrFailQuestBtns'] && !player.voted) {
      showSucceedAndFailBtnsToPlayersOnQuest();
    }
    else if (currentQuest.questVotesNeededLeft <= 0) {
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
    if (GameList[roomCode].questSuccesses >= 3 && GameList[roomCode].winningTeam === null && player.role === 'Assassin') {
      socket.emit('updateStatusMsg', {
        msg: `You are the assassin. <br/> Assassinate the player you think is Merlin to win the game for evil.`
      });
      socket.emit('showAssassinateBtn', true);
    }
  }
}