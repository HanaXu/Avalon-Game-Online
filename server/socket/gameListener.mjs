import {
  GameList,
  updatePlayerCards,
  showSucceedAndFailBtnsToPlayersOnQuest
} from '../index.mjs';

export function gameListener(io, socket, roomCode) {

  socket.on('updateChat', (msg) => {
    GameList[roomCode].chat.push(msg);
    io.in(roomCode).emit('updateChat', msg);
  });

  socket.on('startGame', function (optionalCharacters) {
    if (!validateOptionalCharacters(optionalCharacters, GameList[roomCode].players.length)) return;

    GameList[roomCode].startGame(optionalCharacters);
    updatePlayerCards(io, GameList[roomCode].players);
    io.in(roomCode).emit('startGame');
    io.to(socket.id).emit('showSetupOptionsBtn', false);
    io.in(roomCode).emit('setRoleList', GameList[roomCode].roleList);
    leaderChoosesQuestTeam();
  });

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
        showSucceedAndFailBtnsToPlayersOnQuest(roomCode);
      }
      io.in(roomCode).emit('revealTeamVotes', currentQuest.acceptOrRejectTeam);
    }
  });

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

  socket.on('assassinatePlayer', function (name) {
    const merlinPlayer = GameList[roomCode].getPlayerBy('character', 'Merlin');
    console.log(`\nMerlin is: ${merlinPlayer.name} \nAttempting to assassinate: ${name}.`);

    const msg = merlinPlayer.name === name ? `Assassin successfully discovered and killed ${name}, who was Merlin. Evil Wins!`
      : `Assassin failed to discover and kill Merlin. Good Wins!`;
    updateQuestMsg(msg);
    io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
  });

  //make sure chosen optional characters works for number of players
  //if 5 or 6 players, cannot have more than 1 of Mordred, Oberon, and Morgana
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

  function updateQuestMsg(msg) {
    GameList[roomCode].gameState['questMsg'] = msg;
    io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
  }

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