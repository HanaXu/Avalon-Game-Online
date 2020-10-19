<template>
  <div class="col-md-8">
    <div class="main-board">
      <PlayerCards />
      <QuestCards />
      <VoteTrack />
      <b-button
        v-if="showLobbyBtn"
        @click="goToLobby"
        class="mt-1 avalon-btn-primary big"
        >Go To Lobby</b-button
      >
    </div>
    <GameStatus />
    <VoteResults />
    <Actions />
  </div>
</template>

<script>
import PlayerCards from "@/components/game/PlayerCards.vue";
import QuestCards from "@/components/game/QuestCards.vue";
import VoteTrack from "@/components/game/VoteTrack.vue";
import Actions from "@/components/game/Actions.vue";
import GameStatus from "@/components/game/GameStatus.vue";
import VoteResults from "@/components/game/VoteResults.vue";

export default {
  components: {
    PlayerCards,
    QuestCards,
    VoteTrack,
    Actions,
    GameStatus,
    VoteResults
  },
  data() {
    return {
      showLobbyBtn: false
    };
  },
  methods: {
    goToLobby() {
      this.$socket.emit("resetGame");
    }
  },
  sockets: {
    showLobbyBtn(showLobbyBtn) {
      this.showLobbyBtn = showLobbyBtn;
    }
  }
};
</script>