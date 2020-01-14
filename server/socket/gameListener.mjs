import { GameList, updatePlayerCards } from '../index.mjs';
import {
  sanitizeTeamView,
  validateOptionalCharacters
} from '../game/utility.mjs';

export function gameListener(io, socket, name, roomCode) {
  socket.on('startGame', function (optionalCharacters) {
    const errorMsg = validateOptionalCharacters(optionalCharacters, GameList[roomCode].players.length);
    if (errorMsg.length > 0) {
      socket.emit('updateErrorMsg', errorMsg);
      return;
    }

    GameList[roomCode].startGame(optionalCharacters);
    updatePlayerCards(io, GameList[roomCode].players);
    io.in(roomCode).emit('startGame');
    io.to(socket.id).emit('showHostSetupOptionsBtn', false);
    io.in(roomCode).emit('setRoleList', {
      good: GameList[roomCode].roleList["good"],
      evil: GameList[roomCode].roleList["evil"]
    });
    //empty the history modal in case player is still in same session from a previous game
    io.in(roomCode).emit('updateHistoryModal', []);
    leaderChoosesQuestTeam();
  });

  socket.on('addPlayerToQuest', function (name) {
    let currentQuest = GameList[roomCode].getCurrentQuest();
    GameList[roomCode].addPlayerToQuest(currentQuest.questNum, name);
    updatePlayerCards(io, GameList[roomCode].players);

    if (currentQuest.playersNeededLeft > 0) {
      updateLeaderIsChoosingPlayersMsg(currentQuest);
    } else {
      updateQuestMsg(roomCode, `Waiting for ${currentQuest.leaderInfo.name} to confirm team.`);
      socket.emit('showConfirmTeamBtnToLeader', true);
    }
  });

  socket.on('removePlayerFromQuest', function (name) {
    let currentQuest = GameList[roomCode].getCurrentQuest();
    GameList[roomCode].removePlayerFromQuest(currentQuest.questNum, name);
    updatePlayerCards(io, GameList[roomCode].players);
    updateLeaderIsChoosingPlayersMsg(currentQuest);
    socket.emit('showConfirmTeamBtnToLeader', false);
  });

  socket.on('leaderHasConfirmedTeam', function () {
    let currentQuest = GameList[roomCode].getCurrentQuest();

    io.in(roomCode).emit('hidePreviousQuestVotes');
    socket.emit('showConfirmTeamBtnToLeader', false);
    io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', false);
    currentQuest.leaderHasConfirmedTeam = true;

    GameList[roomCode].gameState['acceptOrRejectTeam'] = true;
    updateQuestMsg(roomCode, 'Waiting for all players to Accept or Reject team.');
    io.in(roomCode).emit('showAcceptOrRejectTeamBtns', true);
  });

  socket.on('playerAcceptsOrRejectsTeam', function (data) {
    const { name, decision } = data;
    let currentQuest = GameList[roomCode].getCurrentQuest();
    currentQuest.acceptOrRejectTeam[decision].push(name);
    currentQuest.acceptOrRejectTeam.voted.push(name);
    GameList[roomCode].getPlayerBy('name', name).votedOnTeam = true;

    updateQuestMsg(roomCode, 'Waiting for all players to Accept or Reject team.');
    socket.emit('showAcceptOrRejectTeamBtns', false);
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
    console.log(`\nMerlin is: ${merlinPlayer.name} \nAttempting to assassinate: ${name}.`);
    const msg = merlinPlayer.name === name ? `Assassin successfully discovered and killed ${name}, who was Merlin. Evil Wins!`
      : `Assassin failed to discover and kill Merlin. Good Wins!`;
    io.in(roomCode).emit('gameOver', msg);
  });

  function leaderChoosesQuestTeam() {
    const currentQuest = GameList[roomCode].getCurrentQuest();

    io.in(roomCode).emit('updateQuestCards', GameList[roomCode].quests);
    io.in(roomCode).emit('updateVoteTrack', currentQuest.voteTrack);
    updateLeaderIsChoosingPlayersMsg(currentQuest);
    console.log(`\nCurrent Quest: ${currentQuest.questNum}`);
    io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', true);
  }

  function updateLeaderIsChoosingPlayersMsg(currentQuest) {
    GameList[roomCode].gameState['questMsg'] = `${currentQuest.leaderInfo.name} is choosing 
                                              ${currentQuest.playersNeededLeft} more players to go on quest 
                                              ${currentQuest.questNum}`;
    io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
  }

  function updateQuestMsg(msg) {
    GameList[roomCode].gameState['questMsg'] = msg;
    io.in(roomCode).emit('updateQuestMsg', GameList[roomCode].gameState['questMsg']);
  }

  function questTeamAcceptedStuff() {
    updateQuestMsg(roomCode, 'Quest team was Approved. Waiting for quest team to go on quest.');
    GameList[roomCode].gameState['acceptOrRejectTeam'] = false;
    GameList[roomCode].gameState['succeedOrFailQuest'] = true;
    GameList[roomCode].players.forEach(player => {
      if (player.onQuest && !player.votedOnQuest) {
        const disableFailBtn = player.team === "Good"; //check if player is good so they can't fail quest
        io.to(player.socketID).emit('succeedOrFailQuest', disableFailBtn);
      }
    });
  }

  function questTeamRejectedStuff(currentQuest) {
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
      updatePlayerCards(io, GameList[roomCode].players);
      leaderChoosesQuestTeam();
    }
  }
  
}