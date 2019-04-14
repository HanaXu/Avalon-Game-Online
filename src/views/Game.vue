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

      <DecideQuestTeam
        :showConfirmTeamButton="showConfirmTeamButton"
        :yourName="yourName"
        :showAcceptRejectButtons="showAcceptRejectButtons"
        :showHasVoted="showHasVoted"
        :showTeamVoteResults="showTeamVoteResults"
        :teamVotes="teamVotes"
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
import DecideQuestTeam from "@/components/DecideQuestTeam.vue";

export default {
  name: "Game",
  components: {
    LobbyList,
    PlayerCards,
    QuestCards,
    VoteTrack,
    SetupOptions,
    DecideQuestTeam
  },
  data() {
    return {
      yourName: null,
      roomCode: null,
      players: [],
      quests: [],
      optionalCharacters: [],

      currentVoteTrack: null,
      questMsg: null,
      showQuestMsg: false,

      showStartButton: false,
      gameStarted: false,

      showAddPlayerButton: false,
      showRemovePlayerButton: false,
      showConfirmTeamButton: false,
      showAcceptRejectButtons: false,

      showHasVoted: false,
      teamVotes: null,
      showTeamVoteResults: false,

      showSetupOptions: false,
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
    //update overall game
    updatePlayers: function(data) {
      this.players = data["players"];
    },
    updateQuests: function(data) {
      this.quests = data["quests"];
    },
    updateVoteTrack: function(data) {
      this.currentVoteTrack = data["voteTrack"];
    },
    //when game starts
    gameReady: function() {
      this.showStartButton = true;
    },
    gameStarted: function() {
      this.gameStarted = true;
      this.error = false;
      this.showSetupOptions = false;
    },
    //choose player for quest stuff
    choosePlayersForQuest: function() {
      this.showAddPlayerButton = true;
      this.showRemovePlayerButton = true;
    },
    updateQuestMsg: function(msg) {
      this.questMsg = msg;
      this.showQuestMsg = true;
    },
    confirmQuestTeam: function(bool) {
      this.showConfirmTeamButton = bool;
    },
    //vote on the quest team
    acceptOrRejectTeam: function(bool) {
      this.showAddPlayerButton = false;
      this.showRemovePlayerButton = false;
      this.showAcceptRejectButtons = bool;
    },
    teamVotes: function(voted) {
      this.teamVotes = voted.join(", "); //make array look nicer
      this.showHasVoted = true;
    },
    revealTeamVotes: function(votes) {
      this.teamVotes = votes;
      this.teamVotes.accept = votes.accept.join(", "); //make array look nicer
      this.teamVotes.reject = votes.reject.join(", ");
      this.showHasVoted = false;
      this.showTeamVoteResults = true;
    },
    //etc
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
