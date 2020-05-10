<template>
  <div class="main-board">
    <b-row class="justify-content-center">
      <span class="col-md-3 col-sm-6">
        Room code: {{ roomCode }}
        <ClipboardIcon copyElementId="roomCode"/>
      </span>
      <input type="hidden" :value="roomCode" id="roomCode" />
      <div v-b-tooltip.bottom title="A minimum of 5 players is required to start the game">
        <span>
          Room capacity:
          <span
            :class="{red: players.length < 5, green: players.length >= 5}"
          >{{players.length}}/10</span>
        </span>
      </div>
    </b-row>
    <b-row>
      <div class="container">
        <b-button class="setupButton" v-if="showSetupOptionsBtn" v-b-modal.setupModal>Setup Options</b-button>
        <ul class="lobbyList">
          <li v-for="(player, index) in players" :key="index" class="offset-1">
            <span v-if="player.name === name" class="self p-1">{{ player.type }}: {{ player.name }}</span>
            <span v-else>{{ player.type }}: {{ player.name }}</span>
          </li>
        </ul>
      </div>
    </b-row>
    <SetupOptions @selectedRoles="updateSetupOptions"></SetupOptions>
    <b-alert v-if="error" variant="danger" show v-html="errorMsg"></b-alert>
    <div v-if="showStartGameBtn">
      <b-button class="avalon-btn-primary big" id="start-game-btn" @click="startGame">Start Game</b-button>
    </div>
  </div>
</template>

<script>
import SetupOptions from "@/components/lobby/SetupOptions.vue";
import ClipboardIcon from "@/components/lobby/ClipboardIcon.vue";
import { mapState } from "vuex";

export default {
  name: "Lobby",
  components: {
    SetupOptions,
    ClipboardIcon
  },
  data() {
    return {
      optionalRoles: [],
      showSetupOptionsBtn: false,
      error: false,
      errorMsg: null,
      showStartGameBtn: false
    };
  },
  computed: mapState(["roomCode", "name", "players"]),
  methods: {
    updateSetupOptions(selectedRoles) {
      this.optionalRoles = selectedRoles;
    },
    startGame() {
      this.$socket.emit("startGame", this.optionalRoles);
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
ul.lobbyList {
  padding: 0;
  margin-top: 1rem;
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