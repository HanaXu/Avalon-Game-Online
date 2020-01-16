<template>
  <div class="main-board">
    <h4>
      Welcome, {{ name }}, to game room {{ roomCode }}.
    </h4>
    <b-row>
      <b-col md="3" offset="2">
        <p v-b-tooltip.bottom title="A minimum of 5 players is required to start the game">
          Room Capacity:
          <span :class="{red: players.length < 5, green: players.length >= 5}">{{players.length}}/10</span>
        </p>
      </b-col>
      <b-col md="5" offset="1">
      <b-form-checkbox
        name="challenge-mode-checkbox"
        v-model="challengeMode"
        :disabled="!showSetupOptionsBtn"
        @input="updateChallengeMode"
        switch
      >
        Challenge mode (No history saved)
      </b-form-checkbox>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="7" offset="1">
        <ul class="lobbyList">
          <li v-for="(player, index) in players" :key="index">{{ player.role }}: {{ player.name }}</li>
        </ul>
      </b-col>
      <b-col md="4" align-self="start" style="padding: 10px 0 0 0">
        <b-button class="setupButton" v-b-modal.setupModal v-if="showSetupOptionsBtn">Setup Options</b-button>
      </b-col>
    </b-row>
    <SetupOptions @clicked="updateSetupOptions"></SetupOptions>
    <b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>
    <div v-if="showStartGameBtn">
      <b-button class="avalon-btn-lg" id="start-game-btn" @click="startGame">Start Game</b-button>
    </div>
  </div>
</template>

<script>
import SetupOptions from "@/components/lobby/SetupOptions.vue";
import { mapState } from 'vuex';

export default {
  name: "Lobby",
  components: {
    SetupOptions
  },
  data() {
    return {
      optionalCharacters: [],
      challengeMode: false,
      showSetupOptionsBtn: false,
      error: false,
      errorMsg: null,
      showStartGameBtn: false
    };
  },
  computed: mapState(['roomCode', 'name', 'players']),
  methods: {
    updateSetupOptions(data) {
      //this is called after Okay is clicked from Setup Options window
      this.optionalCharacters = data;
    },
    startGame() {
      this.$socket.emit("startGame", this.optionalCharacters);
      this.showStartGameBtn = false;
    },
    updateChallengeMode() {
      this.$socket.emit("challengeMode", this.challengeMode);
    }
  },
  sockets: {
    updateChallengeMode(challengeMode) {
      this.challengeMode = challengeMode;
    },
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
</style>