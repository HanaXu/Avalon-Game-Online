<template>
  <div class="row justify-content-md-center py-2">
    <div class="col-md-11">
      <b-alert :show="spectators.length > 0" variant="dark" class="spectators">
        Spectators: 
        <span v-for="(spectator, index) in spectators" :key="index">
          <span :class="{self: spectator.name === playerName}">{{spectator.name}}</span>,
        </span>
      </b-alert>
    </div>
    <div class="col-md-8 px-2">
      <Lobby v-if="!gameStarted" />
      <!-- Game -->
      <div class="main-board" v-if="gameStarted">
        <PlayerCards />
        <QuestCards />
        <VoteTrack />
      </div>
      <GameStatus />
      <VoteResults />
      <Actions />
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
import Actions from "@/components/game/Actions.vue";
import GameStatus from "@/components/game/GameStatus.vue";
import VoteResults from "@/components/game/VoteResults.vue";
import RoleList from "@/components/game/RoleList.vue";
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
    RoleList
  },
  computed: mapState(["playerName"]),
  data() {
    return {
      gameStarted: false,
      spectators: []
    };
  },
  sockets: {
    startGame() {
      this.gameStarted = true;
    },
    updateSpectatorsList(spectators) {
      this.spectators = spectators;
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
  padding: 0.25rem .75rem !important;
}
</style>