<template>
  <div>
    <div class="container text-left" style="margin-top: .5rem">
      <h4>{{ yourName }}, welcome to Avalonline Room: {{ roomCode }}</h4>
    </div>
    <div class="container game">
      <div style="text-align: left; align-items: left; justify-content: left">
        <LobbyList v-if="!gameStarted" :players="players" :yourName="yourName"/>
      </div>

      <div class="setup" v-if="showSetupOptions">
        <!-- "ADD BOT" BUTTON WILL GO HERE IN THIS DIV -->
        <b-form-group label="Include optional characters:" label-size="lg" label-cols-sm="4" label-cols-lg="3">
            <b-form-checkbox-group v-model="selected" name="optionalCharacters" :options="optionalCharacters" stacked>
            </b-form-checkbox-group>
        </b-form-group>
        <p><em><strong>Note:</strong> do not include Morgana unless Percival is also in the game. 5 and 6-player games cannot include more than one optional evil character. 7, 8, and 9-player games cannot include more than two optional evil characters.</em></p>
      </div>


      <b-alert variant="danger" v-if="error" show>
        {{ errorMsg }}
      </b-alert>


      <div v-if="showStartButton">
        <b-button class="avalon-btn-lg" @click="attemptStartGame">Start Game</b-button>
      </div>
      <PlayerCards v-if="gameStarted" :players="players" :yourName="yourName"/>
      <QuestCards v-if="gameStarted" :quests="quests"/>
      <VoteTrack v-if="gameStarted" :currentVoteTrack="currentVoteTrack"/>
    </div>
  </div>
</template>

<script>
import LobbyList from "@/components/LobbyList.vue";
import PlayerCards from "@/components/PlayerCards.vue";
import QuestCards from "@/components/QuestCards.vue";
import VoteTrack from "@/components/VoteTrack.vue";

export default {
  name: "Game",
  components: {
    LobbyList,
    PlayerCards,
    QuestCards,
    VoteTrack
  },
  data() {
    return {
      players: [],
      quests: [],
      // currentQuestNum: null,
      currentVoteTrack: null,
      yourName: null,
      roomCode: null,
      showStartButton: false,
      gameStarted: false
      showSetupOptions: false,
      assignIdentities: false,
      error: false,
      errorMsg: "",
      selected: [],
      optionalCharacters: [
        {text: "Percival (Good, knows Merlin's identity)", value: "percival"},
        {text: "Mordred (Evil, invisible to Merlin)", value: "mordred"},
        {text: "Oberon (Evil, invisible to other Evil characters)", value: "oberon"},
        {text: "Morgana (Evil, appears as Merlin to Percival)", value: "morgana"}
      ]
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
    updateQuests: function(data) {
      this.quests = data["quests"];
      // this.currentQuestNum = data["currentQuestNum"];
      this.currentVoteTrack = data["voteTrack"];
    },
    gameReady: function() {
      this.showStartButton = true;
    },
    gameStarted: function() {
      this.gameStarted = true;
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
  background: #777;
  border-radius: 3px;
  /*height: 75vh;*/
  padding: 1em;
}

.setup {
  color: #000;
  text-align: left;
  background: #f8f9fa; /* bootstrap 4 bg-light*/
  margin: 5px 0;
  padding: 1rem;
  border-radius: 3px;
}

</style>
