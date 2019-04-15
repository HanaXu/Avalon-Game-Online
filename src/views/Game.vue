<template>
  <div>
    <div class="container text-left" style="margin-top: .5rem">
      <h4>
        {{ yourName }}, welcome to Avalonline Room:
        <span id="roomCode">{{ roomCode }}</span>
      </h4>
    </div>
    <div class="container game">
      <EndGameOverlay v-if="gameOver" :endGameMsg="endGameMsg" />

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
        <b-button class="avalon-btn-lg" id="start-game-btn" @click="startGame">Start Game</b-button>
      </div>

      <PlayerCards
        v-if="gameStarted"
        :players="players"
        :yourName="yourName"
        :showAddPlayerButton="showAddPlayerButton"
        :showRemovePlayerButton="showRemovePlayerButton"
        :assassination="assassination"
      />

      <div
        v-if="showQuestMsg && questMsg.length > 0"
        class="row justify-content-md-center"
        style="padding: 1rem;"
      >
        <span class="text-dark">{{ questMsg }}</span>
      </div>

      <DecideQuestTeam :yourName="yourName"/>

      <QuestVotes :yourName="yourName" />

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
import EndGameOverlay from "@/components/EndGameOverlay.vue";
import QuestVotes from "@/components/QuestVotes.vue";

export default {
  name: "Game",
  components: {
    LobbyList,
    PlayerCards,
    QuestCards,
    VoteTrack,
    SetupOptions,
    DecideQuestTeam,
    EndGameOverlay,
    QuestVotes
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

      onQuest: false,
      canVoteOnQuest: false,
      onGoodTeam: null,

      waitingForAssassin: false,
      assassination: false,

      showSetupOptions: false,
      error: false,
      errorMsg: null,

      gameOver: false,
      endGameMsg: null
    };
  },
  created() {
    this.yourName = this.$route.params.yourName;
    this.roomCode = this.$route.params.roomCode;
  },
  methods: {
    clickedSetupOptions(data) {
      //this is called after Okay is clicked from Setup Options window
      this.optionalCharacters = data;
      console.log(`optional characters: ${this.optionalCharacters}`);
    },
    startGame() {
      console.log(`starting game in room: ${this.roomCode}`);
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
    updatePlayers(data) {
      this.players = data["players"];
    },
    updateQuests(data) {
      this.quests = data["quests"];
    },
    updateVoteTrack(data) {
      this.currentVoteTrack = data["voteTrack"];
    },
    //when game starts
    gameReady() {
      this.showStartButton = true;
    },
    gameStarted() {
      this.gameStarted = true;
      this.error = false;
      this.showSetupOptions = false;
    },
    //choose player to go on quest
    choosePlayersForQuest(bool) {
      this.showAddPlayerButton = bool;
      this.showRemovePlayerButton = bool;
    },
    updateQuestMsg(msg) {
      this.questMsg = msg;
      this.showQuestMsg = true;
    },
    //etc
    showHostSetupOptions() {
      this.showSetupOptions = true;
    },
    errorMsg(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.showStartButton = true;
    },

    //assassination time
    beginAssassination(msg) {
      //update player cards to show Assassinate button
      //this.players = data["players"];
      this.assassination = true;
      this.questMsg = msg;
    },
    waitForAssassin(msg) {
      //do nothing
      this.waitingForAssassin = true;
      this.questMsg = msg;
      this.showQuestMsg = true;
    },

    //game is over
    gameOver(msg) {
      this.gameOver = true;
      this.endGameMsg = msg;
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
