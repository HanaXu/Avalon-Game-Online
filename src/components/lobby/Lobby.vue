<template>
  <div class="main-board">
    <h4>
      Welcome, {{ yourName }}, to game room
      <span id="roomCode">{{ roomCode }}</span>.
    </h4>

    <b-row>
      <b-col md="3" offset="2">
        <p v-b-tooltip.bottom title="A minimum of 5 players is required to start the game">
          Room Capacity:
          <span :class="{red: players.length < 5, green: players.length >= 5}">{{players.length}}/10</span>
        </p>
      </b-col>
      <b-col md="5">
        <b-form-checkbox
          v-if="showSetupOptionsBtn"
          id="checkbox-1"
          v-model="challengeMode"
          name="checkbox-1"
          value="ON"
          unchecked-value="OFF"
          @change="emitChallengeMode($event)"
        >
          Challenge Mode (No History Saved):
          <strong>{{ challengeMode }}</strong>
        </b-form-checkbox>
        <div v-if="!showSetupOptionsBtn">
          Challenge Mode (No History Saved):
          <strong>{{ challengeMode }}</strong>
        </div>
      </b-col>
    </b-row>

    <b-row>
      <b-col md="7" offset="1">
        <PlayerList :players="players" />
      </b-col>
      <b-col md="4" align-self="start" style="padding: 10px 0 0 0">
        <b-button class="setupButton" v-b-modal.setupModal v-if="showSetupOptionsBtn">Setup Options</b-button>
      </b-col>
    </b-row>
    <SetupOptions @clicked="clickedSetupOptions" :roomCode="roomCode"></SetupOptions>

    <b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>
    <div v-if="showStartBtn">
      <b-button class="avalon-btn-lg" id="start-game-btn" @click="startGame">Start Game</b-button>
    </div>
  </div>
</template>

<script>
import PlayerList from "@/components/lobby/PlayerList.vue";
import SetupOptions from "@/components/lobby/SetupOptions.vue";

export default {
  name: "Lobby",
  props: ["yourName", "roomCode", "players"],
  components: {
    PlayerList,
    SetupOptions
  },
  data() {
    return {
      optionalCharacters: [],
      challengeMode: "OFF",
      showSetupOptionsBtn: false,
      error: false,
      errorMsg: null,
      showStartBtn: false
    };
  },
  methods: {
    clickedSetupOptions(data) {
      //this is called after Okay is clicked from Setup Options window
      this.optionalCharacters = data;
    },
    startGame() {
      this.$socket.emit("startGame", {
        roomCode: this.roomCode,
        optionalCharacters: this.optionalCharacters
      });
      this.showStartBtn = false;
    },
    emitChallengeMode(mode) {
      this.$socket.emit("challengeMode", mode);
    }
  },
  sockets: {
    updateChallengeMode(str) {
      this.challengeMode = str;
    },
    readyToStartGame() {
      this.showStartBtn = true;
    },
    gameStarted() {
      this.error = false;
      this.showSetupOptionsBtn = false;
    },
    showHostSetupOptionsBtn(bool) {
      this.showSetupOptionsBtn = bool;
    },
    errorMsg(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.showStartBtn = true;
    }
  }
};
</script>

<style>
.red {
  color: red;
}
.green {
  color: green;
}
</style>