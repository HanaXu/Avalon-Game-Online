<template>
  <div>
    <div class="row justify-content-md-center mx-0">
      <div class="col-12 col-md-7">
        <Lobby v-if="!gameStarted" />
        <!-- Game -->
        <div class="container main-board" v-if="gameStarted">
          <PlayerCards
            :showAddBtn="showAddBtn"
            :showRemoveBtn="showRemoveBtn"
            :showAssassinateBtn="showAssassinateBtn"
          />
          <QuestCards />
          <VoteTrack />
        </div>
        <GameStatus v-if="(showQuestMsg && questMsg.length > 0)" :questMsg="questMsg" />
        <PlayerVoteStatus />
        <QuestVotes />
        <DecideQuestTeam />
      </div>
      <!-- Misc -->
      <div class="col-12 col-md-3">
        <div class="container chat">
          <RoleList v-if="gameStarted" />
          <Chat />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Lobby from "@/components/lobby/Lobby.vue";
import Chat from "@/components/lobby/Chat.vue";
import PlayerCards from "@/components/game/PlayerCards.vue";
import QuestCards from "@/components/game/QuestCards.vue";
import VoteTrack from "@/components/game/VoteTrack.vue";
import DecideQuestTeam from "@/components/game/DecideQuestTeam.vue";
import QuestVotes from "@/components/game/QuestVotes.vue";
import GameStatus from "@/components/game/GameStatus.vue";
import PlayerVoteStatus from "@/components/game/PlayerVoteStatus.vue";
import RoleList from "@/components/game/RoleList.vue";

export default {
  name: "Game",
  components: {
    Lobby,
    PlayerCards,
    Chat,
    QuestCards,
    VoteTrack,
    DecideQuestTeam,
    QuestVotes,
    GameStatus,
    PlayerVoteStatus,
    RoleList
  },
  data() {
    return {
      questMsg: null,
      showQuestMsg: false,
      gameStarted: false,
      showAddBtn: false,
      showRemoveBtn: false,
      showAssassinateBtn: false
    };
  },
  sockets: {
    startGame() {
      this.gameStarted = true;
    },
    showAddRemovePlayerBtns(showAddRemovePlayerBtns) {
      this.showAddBtn = showAddRemovePlayerBtns;
      this.showRemoveBtn = showAddRemovePlayerBtns;
    },
    updateQuestMsg(msg) {
      this.questMsg = msg;
      this.showQuestMsg = true;
    },
    beginAssassination(msg) {
      this.showAssassinateBtn = true;
      this.questMsg = msg;
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