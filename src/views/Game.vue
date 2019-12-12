<template>
  <div>
    <div class="row justify-content-md-center mx-0">
      <div class="col-12 col-md-7">
        <EndGameOverlay/>
        <Lobby v-if="!gameStarted" :players="players"/>
        <!-- Actual Game -->
        <div class="container main-board" v-if="gameStarted">
          <PlayerCards
            :players="players"
            :showAddBtn="showAddBtn"
            :showRemoveBtn="showRemoveBtn"
            :showAssassinateBtn="showAssassinateBtn"
          />
          <QuestCards />
          <VoteTrack />
        </div>
        <GameStatus v-if="(showQuestMsg && questMsg.length > 0)" :questMsg="questMsg"/>
        <PlayerVoteStatus/>
        <QuestVotes />
        <DecideQuestTeam />
      </div>
      <div class="col-12 col-md-3">
        <div class="container chat">
          <RoleList v-if="gameStarted"/>
          <div style="align: right">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Lobby from "@/components/lobby/Lobby.vue";
import PlayerCards from "@/components/PlayerCards.vue";
import Chat from "@/components/lobby/Chat.vue";
import QuestCards from "@/components/QuestCards.vue";
import VoteTrack from "@/components/VoteTrack.vue";
import DecideQuestTeam from "@/components/DecideQuestTeam.vue";
import EndGameOverlay from "@/components/EndGameOverlay.vue";
import QuestVotes from "@/components/QuestVotes.vue";
import GameStatus from "@/components/GameStatus.vue";
import PlayerVoteStatus from "@/components/PlayerVoteStatus.vue";
import RoleList from "@/components/RoleList.vue";

export default {
  name: "Game",
  components: {
    Lobby,
    PlayerCards,
    Chat,
    QuestCards,
    VoteTrack,
    DecideQuestTeam,
    EndGameOverlay,
    QuestVotes,
    GameStatus,
    PlayerVoteStatus,
    RoleList
  },
  data() {
    return {
      players: [],
      questMsg: null,
      showQuestMsg: false,
      gameStarted: false,
      showAddBtn: false,
      showRemoveBtn: false,
      showAssassinateBtn: false,
      gameOver: false,
      endGameMsg: null
    };
  },
  sockets: {
    updatePlayerCards(players) {
      this.players = players;
    },
    startGame() {
      this.gameStarted = true;
    },
    showAddRemovePlayerBtns(data) {
      this.showAddBtn = data.bool;
      this.showRemoveBtn = data.bool;
    },
    updateQuestMsg(msg) {
      this.questMsg = msg;
      this.showQuestMsg = true;
    },
    beginAssassination(msg) {
      this.showAssassinateBtn = true;
      this.questMsg = msg;
    },
    gameOver(msg) {
      this.gameOver = true;
      this.endGameMsg = msg;
    }
  }
};
</script>

<style>
.main-board {
  background: #eae7e3;
  border-radius: 5px;
  margin: 10px;
  min-height: 40vh;
  padding: 4px !important;
  clear: none;
  box-shadow: 0 2px 5px #c2ab8e;
}
.game-section {
  background: #eae7e3;
  border-radius: 5px;
  padding: 4px !important;
  box-shadow: 0 2px 5px #c2ab8e;
}
</style>