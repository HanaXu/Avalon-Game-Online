<template>
  <div class="row justify-content-md-center py-3">
    <div class="col-md-8 px-2">
      <Lobby v-if="!gameStarted" />
      <!-- Game -->
      <div class="main-board" v-if="gameStarted">
        <PlayerCards />
        <QuestCards />
        <VoteTrack />
      </div>
      <GameStatus />
      <VoteStatus />
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
import VoteStatus from "@/components/game/VoteStatus.vue";
import RoleList from "@/components/game/RoleList.vue";

export default {
  components: {
    Lobby,
    PlayerCards,
    Chat,
    QuestCards,
    VoteTrack,
    Actions,
    GameStatus,
    VoteStatus,
    RoleList
  },
  data() {
    return {
      gameStarted: false
    };
  },
  sockets: {
    startGame() {
      this.gameStarted = true;
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