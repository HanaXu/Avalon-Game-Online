import { GameList, updatePlayerCards } from '../index.mjs';

export function disconnectListener(io, socket, roomCode) {
  socket.on('disconnect', function () {
    if (Object.keys(GameList).length != 0 && typeof GameList[roomCode] !== 'undefined') {
      const players = GameList[roomCode].players;

      if (GameList[roomCode].gameIsStarted) {
        GameList[roomCode].getPlayerBy('socketID', socket.id).disconnected = true;
        updatePlayerCards(io, players);
      }
      else { // player is in lobby
        GameList[roomCode].deletePlayer(socket.id);
        io.in(roomCode).emit('updatePlayerCards', players);
      }
    }
  });
}

export function reconnectPlayerToStartedGame(io, socket, name, roomCode) {
  console.log(`\nreconnecting ${name} to room ${roomCode}`)
  let existingPlayer = GameList[roomCode].getPlayerBy('name', name);
  existingPlayer.socketID = socket.id;
  existingPlayer.disconnected = false;

  socket.emit('passedValidation', { name, roomCode });
  socket.join(roomCode);

  //show game instead of lobby
  if (GameList[roomCode].gameIsStarted) {
    socket.emit('startGame');
    io.in(roomCode).emit('setRoleList', GameList[roomCode].roleList);
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
  else if (currentQuest.acceptOrRejectTeam.voted.length === currentQuest.totalNumPlayers) {
    io.in(roomCode).emit('revealAcceptOrRejectTeam', currentQuest.acceptOrRejectTeam);
  }

  if (GameList[roomCode].gameState['succeedOrFailQuest'] === true) {
    showSucceedAndFailBtnsToPlayersOnQuest();
  }
  if (currentQuest.leaderInfo.name === name && !currentQuest.leaderHasConfirmedTeam) {
    currentQuest.leaderInfo.socketID = socket.id;
    io.to(currentQuest.leaderInfo.socketID).emit('showAddRemovePlayerBtns', true);
    socket.emit('showConfirmTeamBtnToLeader', false);
  }
  if (currentQuest.leaderInfo.name === name && currentQuest.playersNeededLeft <= 0 && !currentQuest.leaderHasConfirmedTeam) {
    socket.emit('showConfirmTeamBtnToLeader', true);
  }

  function showSucceedAndFailBtnsToPlayersOnQuest() {
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
}
