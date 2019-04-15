<template>
  <div>
    <div class="container text-left" style="margin-top: .5rem">
      <h4>
        {{ yourName }}, welcome to Avalonline Room:
        <span id="roomCode">{{ roomCode }}</span>
      </h4>
    </div>
    <div class="container game">
      <b-row>
        <b-col cols="10">
          <div style="text-align: left; align-items: left; justify-content: left">
            <LobbyList v-if="!assignIdentities" :players="players" :yourName="yourName"/>
          </div>
        </b-col>

        <b-col>
          <b-button class="setupButton" v-b-modal.setupModal v-if="showSetupOptions">Setup Options</b-button>
        </b-col>
      </b-row>

      <SetupOptions @clicked="clickedSetupOptions"></SetupOptions>

      <b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>

      <div v-if="showStartButton">
        <b-button class="avalon-btn-lg" @click="startGame">Start Game</b-button>
      </div>
      <PlayerCards v-if="assignIdentities" :players="players" :yourName="yourName"/>
    </div>
    <div class="container chat">
      <div style="align: right">
        <Chat :your-name="yourName" :room-code="roomCode"></Chat>
      </div>
    </div>
  </div>
</template>

<script>
import LobbyList from "../components/LobbyList.vue";
import PlayerCards from "../components/PlayerCards.vue";
import Chat from "../components/Chat.vue";
import SetupOptions from "@/components/SetupOptions.vue";

export default {
  name: "Game",
  components: {
    LobbyList,
    PlayerCards,
    Chat,
    SetupOptions
  },
  data() {
    return {
      players: [],
      yourName: null,
      roomCode: null,
      showStartButton: false,
      showSetupOptions: false,
      assignIdentities: false,
      selected: [],
      error: false,
      errorMsg: null
    };
  },
  created() {
    this.yourName = this.$route.params.yourName;
    this.roomCode = this.$route.params.roomCode;
  },
  methods: {
    clickedSetupOptions: function(data) {
      //this is called after Okay is clicked from Setup Options window
      console.log("selectedOptions emitted");
      this.selected = data;
      console.log(this.selected);
    },
    startGame: function() {
      console.log("starting game in room: " + this.roomCode);
      //emit startGame with roomcode & optional character choices
      this.$socket.emit("startGame", {
        roomCode: this.roomCode,
        optionalCharacters: this.selected
      });
      this.showStartButton = false;
    }
  },
  sockets: {
    updatePlayers: function(data) {
      this.players = data["players"];
    },
    gameReady: function() {
      this.showStartButton = true;
    },
    identitiesAssigned: function() {
      this.assignIdentities = true;
      this.showSetupOptions = false;
      this.error = false;
    },
    showHostSetupOptions: function() {
      this.showSetupOptions = true;
    },
    errorMsg: function(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.showStartButton = true;
    }
  }
};
</script>

<style>
.game {
  background: #eae7e3;
  border-radius: 3px;
  padding: 1em;
  min-height: 75vh;
}

.setupButton {
  float: right;
}
</style>
