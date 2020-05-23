<template>
  <div class="row justify-content-md-center py-2">
    <div class="col-md-11">
      <Spectators />
    </div>
    <div class="col-md-8">
      <Lobby v-if="!gameStarted" />
      <!-- Game -->
      <div class="main-board" v-if="gameStarted">
        <PlayerCards />
        <QuestCards />
        <VoteTrack />
        <b-button
          v-if="showLobbyBtn"
          @click="goToLobby"
          class="mt-1 avalon-btn-primary big"
        >Go To Lobby</b-button>
      </div>
      <GameStatus />
      <VoteResults />
      <Actions />
    </div>
    <!-- Misc -->
    <div class="col-md-3">
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
import Actions from "@/components/game/Actions.vue";
import GameStatus from "@/components/game/GameStatus.vue";
import VoteResults from "@/components/game/VoteResults.vue";
import RoleList from "@/components/game/RoleList.vue";
import Spectators from "@/components/game/Spectators.vue";
import { mapState } from "vuex";

export default {
  components: {
    Lobby,
    PlayerCards,
    Chat,
    QuestCards,
    VoteTrack,
    Actions,
    GameStatus,
    VoteResults,
    RoleList,
    Spectators
  },
  computed: mapState(["playerName"]),
  data() {
    return {
      gameStarted: false,
      showLobbyBtn: false
    };
  },
  methods: {
    goToLobby() {
      this.$socket.emit('resetGame');
    }
  },
  sockets: {
    startGame(startGame) {
      this.gameStarted = startGame;
      if (startGame) {
        sessionStorage.clear();
      }
    },
    showLobbyBtn(showLobbyBtn) {
      this.showLobbyBtn = showLobbyBtn;
    }
  }
};
</script>

<style>
.main-board {
  background: rgba(234, 231, 227, 0.5);
  border-radius: 5px;
  min-height: 40vh;
  margin-bottom: 0.5rem;
  padding: 1rem;
  box-shadow: 0 2px 5px #c2ab8e;
}
.game-section {
  background: rgba(234, 231, 227, 0.5);
  border-radius: 5px;
  padding: 5px;
  box-shadow: 0 2px 5px #c2ab8e;
}
.spectators {
  margin-top: 0 !important;
  padding: 0.25rem 0.75rem !important;
}
</style>