<template>
  <div class="main-board">
    <b-row class="justify-content-center mt-2">
      <p class="col-md-3 col-sm-6 mb-0">Room code: {{ roomCode }}</p>
      <div
        class="col-md-3 col-sm-6 mb-0"
        v-b-tooltip.bottom
        title="A minimum of 5 players is required to start the game"
      >
        <p class="mb-0">
          Room capacity:
          <span
            :class="{red: players.length < 5, green: players.length >= 5}"
          >{{players.length}}/10</span>
        </p>
      </div>
    </b-row>
    <b-row>
      <div class="container">
        <b-button class="setupButton" v-if="showSetupOptionsBtn" v-b-modal.setupModal>Setup Options</b-button>
        <ul class="lobbyList">
          <li v-for="(player, index) in players" :key="index" class="offset-1">
            <span v-if="player.name === name" class="self p-1">{{ player.role }}: {{ player.name }}</span>
            <span v-else>{{ player.role }}: {{ player.name }}</span>
          </li>
        </ul>
      </div>
    </b-row>
    <SetupOptions @clicked="updateSetupOptions"></SetupOptions>
    <b-alert v-if="error" variant="danger" show>{{ errorMsg }}</b-alert>
    <div v-if="showStartGameBtn">
      <b-button class="avalon-btn-primary big" id="start-game-btn" @click="startGame">Start Game</b-button>
    </div>
  </div>
</template>

<script>
import SetupOptions from "@/components/lobby/SetupOptions.vue";
import { mapState } from "vuex";

export default {
  name: "Lobby",
  components: {
    SetupOptions
  },
  data() {
    return {
      optionalCharacters: [],
      showSetupOptionsBtn: false,
      error: false,
      errorMsg: null,
      showStartGameBtn: false
    };
  },
  computed: mapState(["roomCode", "name", "players"]),
  methods: {
    updateSetupOptions(data) {
      //this is called after Okay is clicked from Setup Options window
      this.optionalCharacters = data;
    },
    startGame() {
      this.$socket.emit("startGame", this.optionalCharacters);
      this.showStartGameBtn = false;
    }
  },
  sockets: {
    showStartGameBtn() {
      this.showStartGameBtn = true;
    },
    startGame() {
      this.error = false;
      this.showSetupOptionsBtn = false;
    },
    showSetupOptionsBtn(bool) {
      this.showSetupOptionsBtn = bool;
    },
    updateErrorMsg(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.showStartGameBtn = true;
    }
  }
};
</script>

<style scoped>
.red {
  color: red;
}
.green {
  color: green;
}
ul {
  padding: 0;
  padding-top: 1rem;
}
li {
  padding-left: 1.5rem;
}
.setupButton {
  float: right;
}
.lobbyList {
  list-style-type: none;
  text-align: left;
  font-size: 20px;
}
</style>