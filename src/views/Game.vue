<template>
  <div>
    <div class="container text-left" style="margin-top: .5rem">
      <h4>{{ yourName }}, welcome to Avalonline Room: {{ roomCode }}</h4>
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

      <b-alert variant="danger" v-if="error" show>
        {{ errorMsg }}
      </b-alert>


      <div v-if="showStartButton">
        <b-button class="avalon-btn-lg" @click="attemptStartGame">Start Game</b-button>
      </div>
      <PlayerCards v-if="assignIdentities" :players="players" :yourName="yourName"/>


    </div>


    <b-modal id="setupModal">
      <SetupOptions></SetupOptions>
    </b-modal>
  </div>
</template>

<script>
import LobbyList from "@/components/LobbyList.vue";
import PlayerCards from "@/components/PlayerCards.vue";
import SetupOptions from "@/components/SetupOptions.vue";

export default {
  name: "Game",
  components: {
    LobbyList,
    PlayerCards,
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
      error: false,
      errorMsg: ""
    };
  },
  created() {
    this.yourName = this.$route.params.yourName;
    this.roomCode = this.$route.params.roomCode;
    console.log("roomcode is: " + this.roomCode);
  },
  methods: {
    attemptStartGame: function() {
      console.log("attemptStartGame()");
      //check to make sure chosen optional characters works for number of players
      //if 5 or 6 players, cannot have more than 1 of Mordred, Oberon, and Morgana
      if((this.players.length <= 6) &&
        ((this.selected.includes("mordred") && this.selected.includes("oberon")) ||
        (this.selected.includes("mordred") && this.selected.includes("morgana")) ||
        (this.selected.includes("oberon") && this.selected.includes("morgana")))
      ){
        this.errorMsg = "Error: game with 5 or 6 players can only include 1 of Mordred, Oberon, or Morgana. Please select only one then click Start Game again.";
        this.error = true;
        console.log(this.errorMsg);
      }
      else if (this.players.length > 6 && this.players.length < 10 && this.selected.includes("mordred") && this.selected.includes("oberon") && this.selected.includes("morgana")){
        this.errorMsg = "Error: game with 7, 8, or 9 players can only include 2 of Mordred, Oberon, or Morgana. Please de-select one then click Start Game again.";
        this.error = true;
        console.log(this.errorMsg);
      }
      else {
        this.startGame();
      }
    },
    startGame: function() {
      console.log("starting game in room: " + this.roomCode);
      //emit startGame with roomcode & optional character choices
      this.$socket.emit("startGame", {"roomCode" : this.roomCode, "optionalCharacters" : this.selected});
      this.showStartButton = false;
    }
  },
  sockets: {
    connect: function() {
      console.log("socket connected");
    },
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
    }
  }
};
</script>

<style>
.game {
  background: #eae7e3;
  border-radius: 3px;
  /*height: 75vh;*/
  padding: 1em;
}

.setupButton {
  float: right;
}

</style>
