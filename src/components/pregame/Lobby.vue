<template>
  <div class="main-board">
    <h4>
      Welcome, {{ yourName }}, to game room
      <span id="roomCode">{{ roomCode }}</span>.
    </h4>

    <b-row>
      <b-col md="3" offset="2">
        <p>Room Capacity: {{players.length}}/10</p>
      </b-col>
      <b-col md="5">
        <b-form-checkbox
          v-if="showSetupOptions"
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
        <div v-if="!showSetupOptions">
          Challenge Mode (No History Saved):
          <strong>{{ challengeMode }}</strong>
        </div>
      </b-col>
    </b-row>

    <b-row>
      <b-col md="7" offset="1">
        <PlayerList :players="players"/>
      </b-col>
      <b-col md="4" align-self="start" style="padding: 10px 0 0 0">
        <b-button class="setupButton" v-b-modal.setupModal v-if="showSetupOptions">Setup Options</b-button>
      </b-col>
    </b-row>
    <SetupOptions @clicked="clickedSetupOptions" :roomCode="roomCode"></SetupOptions>

    <b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>
    <div v-if="showStartButton">
      <b-button class="avalon-btn-lg" id="start-game-btn" @click="startGame">Start Game</b-button>
    </div>
  </div>
</template>

<script>
import PlayerList from "@/components/pregame/PlayerList.vue";
import SetupOptions from "@/components/pregame/SetupOptions.vue";

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
      showSetupOptions: false,
      error: false,
      errorMsg: null,
      showStartButton: false
    };
  },
  methods: {
    clickedSetupOptions(data) {
      //this is called after Okay is clicked from Setup Options window
      this.optionalCharacters = data;
      console.log(`optional characters: ${this.optionalCharacters}`);
      console.log(`Data is: ${data}`);
    },
    startGame() {
      console.log(`starting game in room: ${this.roomCode}`);
      this.$socket.emit("startGame", {
        roomCode: this.roomCode,
        optionalCharacters: this.optionalCharacters
      });
      this.showStartButton = false;
    },
    emitChallengeMode(mode) {
      this.$socket.emit("challengeMode", mode);
    }
  },
  sockets: {
    updateChallengeMode(str) {
      this.challengeMode = str;
    },
    gameReady() {
      this.showStartButton = true;
    },
    gameStarted() {
      this.error = false;
      this.showSetupOptions = false;
    },
    showHostSetupOptions(bool) {
      this.showSetupOptions = bool;
    },
    errorMsg(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.showStartButton = true;
    }
  }
};
</script>
