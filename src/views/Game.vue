<template>
  <div class="row justify-content-md-center py-3">
    <div class="col-md-8 px-2">
      <Lobby v-if="!gameStarted" />
      <!-- Game -->
      <div class="main-board" v-if="gameStarted">
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
    <div class="col-md-3 px-2">
      <RoleList v-if="gameStarted" />
      <Chat />
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
    showAssassinateBtn(showAssassinateBtn) {
      this.showAssassinateBtn = showAssassinateBtn;
    }
  }
};
</script>

<style>
.main-board {
  background: #eae7e3;
  border-radius: 5px;
  min-height: 40vh;
  margin-bottom: .5rem;
  padding: 1rem;
  box-shadow: 0 2px 5px #c2ab8e;
}
.game-section {
  background: #eae7e3;
  border-radius: 5px;
  padding: 5px;
  box-shadow: 0 2px 5px #c2ab8e;
}
</style>