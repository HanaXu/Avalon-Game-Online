import { GameList, updatePlayerCards } from '../index.mjs';

export function gameListener(io, socket, name, roomCode) {
  socket.on('startGame', function (optionalCharacters) {
    if (!validateOptionalCharacters(optionalCharacters, GameList[roomCode].players.length)) return;

    GameList[roomCode].startGame(optionalCharacters);
    updatePlayerCards(io, GameList[roomCode].players);
    io.in(roomCode).emit('startGame');
    io.to(socket.id).emit('showSetupOptionsBtn', false);
    io.in(roomCode).emit('setRoleList', {
      good: GameList[roomCode].roleList["good"],
      evil: GameList[roomCode].roleList["evil"]
    });
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
    io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', false);
    currentQuest.leaderHasConfirmedTeam = true;

    GameList[roomCode].gameState['acceptOrRejectTeam'] = true;
    updateQuestMsg('Waiting for all players to Accept or Reject team.');
    io.in(roomCode).emit('showAcceptOrRejectTeamBtns', true);
  });

  socket.on('playerAcceptsOrRejectsTeam', function (data) {
    const { name, decision } = data;
    let currentQuest = GameList[roomCode].getCurrentQuest();
    currentQuest.acceptOrRejectTeam[decision].push(name);
    currentQuest.acceptOrRejectTeam.voted.push(name);
    GameList[roomCode].getPlayerBy('name', name).votedOnTeam = true;

    updateQuestMsg('Waiting for all players to Accept or Reject team.');
    socket.emit('showAcceptOrRejectTeamBtns', false);
    io.in(roomCode).emit('updateConcealedTeamVotes', currentQuest.acceptOrRejectTeam.voted);

    //everyone has voted, reveal the votes & move to next step
    if (currentQuest.acceptOrRejectTeam.voted.length === currentQuest.totalNumPlayers) {
      GameList[roomCode].gameState['acceptOrRejectTeam'] = false;
      GameList[roomCode].resetPlayersProperty('votedOnTeam');
      const teamIsRejected = currentQuest.acceptOrRejectTeam.reject.length >= GameList[roomCode].players.length / 2;
      teamIsRejected ? currentQuest.acceptOrRejectTeam.result = 'rejected' : currentQuest.acceptOrRejectTeam.result = 'accepted';

      io.in(roomCode).emit('revealTeamVotes', currentQuest.acceptOrRejectTeam);
      if (teamIsRejected) {
        incrementVoteTrackAndAssignNextLeader(currentQuest, `Quest team was rejected. Assigning next leader.`);
      } else {
        showSucceedAndFailBtnsToPlayersOnQuest();
      }
    }
  });

  socket.on('questVote', function (data) {
    const { name, decision } = data;
    GameList[roomCode].getPlayerBy('name', name).votedOnQuest = true;

    let currentQuest = GameList[roomCode].getCurrentQuest();
    const votes = currentQuest.votes;
    votes[decision]++;
    votes.voted.push(name);
    io.in(roomCode).emit('updateConcealedQuestVotes', votes.voted); //show that player has made some kind of vote

    //check if number of received votes is max needed
    if ((votes.succeed + votes.fail) == currentQuest.playersRequired) {
      GameList[roomCode].gameState['succeedOrFailQuest'] = false;
      currentQuest.assignResult();
      io.in(roomCode).emit('hidePreviousTeamVotes');
      io.in(roomCode).emit('revealQuestResults', votes);
      io.in(roomCode).emit('updateBotRiskScores', currentQuest);
      io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
      GameList[roomCode].resetPlayersProperty('votedOnQuest');
      checkForGameOver(roomCode);
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

  //check to make sure chosen optional characters works for number of players
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

  function showSucceedAndFailBtnsToPlayersOnQuest() {
    updateQuestMsg('Quest team was Approved. Waiting for quest team to go on quest.');
    GameList[roomCode].gameState['acceptOrRejectTeam'] = false;
    GameList[roomCode].gameState['succeedOrFailQuest'] = true;
    GameList[roomCode].players.forEach(player => {
      if (player.onQuest && !player.votedOnQuest) {
        const disableFailBtn = player.team === "Good"; //check if player is good so they can't fail quest
        io.to(player.socketID).emit('succeedOrFailQuest', disableFailBtn);
      }
    });
  }

  function incrementVoteTrackAndAssignNextLeader(currentQuest, msg) {
    io.in(roomCode).emit('updateBotRiskScores', currentQuest);
    currentQuest.voteTrack++;
    updateQuestMsg(msg);

    //check if voteTrack has exceeded 5 (game over)
    if (currentQuest.voteTrack > 5) {
      updateQuestMsg(`Quest ${currentQuest.questNum} had 5 failed team votes. Evil Wins!`);
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    } else { //assign next leader
      GameList[roomCode].resetPlayersProperty('onQuest');
      GameList[roomCode].quests[currentQuest.questNum].resetQuest();
      GameList[roomCode].assignNextLeader(currentQuest.questNum);
      updatePlayerCards(io, GameList[roomCode].players);
      leaderChoosesQuestTeam();
    }
  }

  function checkForGameOver() {
    const { questNum } = GameList[roomCode].getCurrentQuest();
    const questScores = GameList[roomCode].tallyQuestScores();

    //evil has won, game over
    if (questScores.fails >= 3) {
      GameList[roomCode].resetPlayersProperty('onQuest');
      GameList[roomCode].quests[questNum].resetQuest();
      updateQuestMsg(`${questScores.fails} quests failed. Evil Wins!`);
      io.in(roomCode).emit('updatePlayerCards', GameList[roomCode].players);
    }
    //good is on track to win, evil can assassinate
    else if (questScores.successes >= 3) {
      const assassinSocketID = GameList[roomCode].getPlayerBy('character', 'Assassin').socketID;
      updateQuestMsg(`Good has triumphed over Evil by succeeding  ${questScores.successes} quests. 
                      Waiting for Assassin to attempt to assassinate Merlin.`)

      io.to(assassinSocketID).emit('beginAssassination', `You are the assassin. 
    Choose the player you think is Merlin to attempt to assassinate them and win the game for Evil.`);
    }
    else {
      //choose next leader and start next quest
      GameList[roomCode].startNextQuest(questNum);
      updatePlayerCards(io, GameList[roomCode].players);
      leaderChoosesQuestTeam();
    }
  }
  
}