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
            <LobbyList v-if="!gameStarted" :players="players" :yourName="yourName"/>
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
      <PlayerCards
        v-if="gameStarted"
        :players="players"
        :yourName="yourName"
        :showAddPlayerButton="showAddPlayerButton"
        :showRemovePlayerButton="showRemovePlayerButton"
      />

      <div v-if="showQuestMsg" class="row justify-content-md-center" style="padding: 1rem;">
        <span class="text-dark">{{ questMsg }}</span>
      </div>

      <QuestVote v-if="showQuestVoteButtons"
        :showAcceptRejectButtons="showAcceptRejectButtons"
        :yourName="yourName"
      />

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
import SetupOptions from "@/components/SetupOptions.vue";
import QuestVote from "@/components/QuestVote.vue";

export default {
  name: "Game",
  components: {
    LobbyList,
    PlayerCards,
    QuestCards,
    VoteTrack,
    SetupOptions,
    QuestVote
  },
  data() {
    return {
      players: [],
      quests: [],
      currentVoteTrack: null,
      questMsg: null,
      showQuestMsg: false,
      yourName: null,
      roomCode: null,
      showStartButton: false,
      gameStarted: false,
      showQuestVoteButtons: false,
      showAddPlayerButton: false,
      showRemovePlayerButton: false,
      showAcceptRejectButtons: false,
      showSetupOptions: false,
      optionalCharacters: [],
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
      this.optionalCharacters = data;
      console.log(this.optionalCharacters);
    },
    startGame: function() {
      console.log("starting game in room: " + this.roomCode);
      //emit startGame with roomcode & optional character choices
      this.$socket.emit("startGame", {
        roomCode: this.roomCode,
        optionalCharacters: this.optionalCharacters
      });
      this.showStartButton = false;
    }
  },
  sockets: {
    updatePlayers: function(data) {
      this.players = data["players"];
    },
    updateQuests: function(data) {
      this.quests = data["quests"];
    },
    updateVoteTrack: function(data) {
      this.currentVoteTrack = data["voteTrack"];
    },
    gameReady: function() {
      this.showStartButton = true;
    },
    showHostSetupOptions: function() {
      this.showSetupOptions = true;
    },
    gameStarted: function() {
      this.gameStarted = true;
      this.error = false;
      this.showSetupOptions = false;
    },
    choosePlayersForQuest: function() {
      this.showQuestVoteButtons = true;
      this.showAddPlayerButton = true;
      this.showRemovePlayerButton = true;
    },
    acceptOrRejectTeam: function(data) {
      this.questMsg = data;
      this.showQuestVoteButtons = true;
      this.showAddPlayerButton = false;
      this.showRemovePlayerButton = false;
      this.showAcceptRejectButtons = true;
    },
    toggleAcceptRejectButtons: function(bool) {
      this.showAcceptRejectButtons = bool;
      console.log("showAcceptRejectButtons: " + bool);
    },
    updateQuestMsg: function(data) {
      this.questMsg = data["questMsg"];
      this.showQuestMsg = true;
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
