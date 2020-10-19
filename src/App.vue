<template>
  <div id="app">
    <Navbar />
    <div class="row justify-content-center">
      <b-alert
        class="col-md-8 position-absolute"
        :show="serverStatus === 'Disconnected'"
        variant="danger"
        dismissible
      >
        <span>You have disconnected from the server.</span>
      </b-alert>
      <div v-if="serverStatus !== 'Disconnected'" class="col-md-11 py-2">
        <Spectators />
      </div>
      <router-view />
      <div v-if="roomCode !== null" class="col-md-3">
        <RoleList v-if="gameStarted" />
        <Chat />
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/navbar/Navbar.vue";
import Spectators from "@/components/game/Spectators.vue";
import Chat from "@/components/lobby/Chat.vue";
import RoleList from "@/components/game/RoleList.vue";
import { mapState } from "vuex";

export default {
  components: {
    Navbar,
    Spectators,
    Chat,
    RoleList
  },
  computed: mapState(["serverStatus", "roomCode", "gameStarted"]),
};
</script>

<style lang="scss">
@import "./assets/common.scss";

.spectators {
  margin: 0 !important;
  padding: 0.25rem 0.75rem !important;
}

.main-board {
  background: rgba(234, 231, 227, 0.5);
  border-radius: 5px;
  min-height: 40vh;
  margin-bottom: 0.5rem;
  padding: 1rem;
  box-shadow: 0 2px 5px #c2ab8e;
}
</style>