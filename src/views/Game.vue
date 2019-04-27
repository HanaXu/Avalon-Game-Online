<template>
  <div>
    <div class="row justify-content-md-center mx-0">
      <div class="col-12 col-md-7">
        <EndGameOverlay/>

        <div class="main-board" v-if="!gameStarted">
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
              <LobbyList :players="players"/>
            </b-col>
            <b-col md="4" align-self="start" style="padding: 10px 0 0 0">
              <b-button
                class="setupButton"
                v-b-modal.setupModal
                v-if="showSetupOptions"
              >Setup Options</b-button>
            </b-col>
          </b-row>
          <SetupOptions @clicked="clickedSetupOptions" :roomCode="roomCode"></SetupOptions>

          <b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>
          <div v-if="showStartButton">
            <b-button class="avalon-btn-lg" id="start-game-btn" @click="startGame">Start Game</b-button>
          </div>
        </div>

        <div class="container main-board" v-if="gameStarted">
          <PlayerCards
            v-if="gameStarted"
            :players="players"
            :yourName="yourName"
            :showAddPlayerButton="showAddPlayerButton"
            :showRemovePlayerButton="showRemovePlayerButton"
            :assassination="assassination"
          />
          <QuestCards v-if="gameStarted" :quests="quests"/>
          <VoteTrack v-if="gameStarted" :currentVoteTrack="currentVoteTrack"/>
        </div>

        <GameStatus v-if="(showQuestMsg && questMsg.length > 0)" :questMsg="questMsg"/>
        <PlayerVoteStatus v-if="showPlayerVoteStatus"/>

        <QuestVotes :yourName="yourName"/>
        <DecideQuestTeam :yourName="yourName"/>
      </div>

      <div class="col-12 col-md-3">
        <div class="container chat">
          <RoleList v-if="gameStarted"/>
          <div style="align: right">
            <Chat :your-name="yourName" :room-code="roomCode"></Chat>
          </div>
        </div>
      </div>
    </div>

    <b-navbar class="navbar-default footer" fixed="bottom">Show Chat</b-navbar>
  </div>
</template>

<script>
import LobbyList from "@/components/pregame/LobbyList.vue";
import PlayerCards from "@/components/PlayerCards.vue";
import Chat from "@/components/pregame/Chat.vue";
import QuestCards from "@/components/QuestCards.vue";
import VoteTrack from "@/components/VoteTrack.vue";
import SetupOptions from "@/components/pregame/SetupOptions.vue";
import DecideQuestTeam from "@/components/DecideQuestTeam.vue";
import EndGameOverlay from "@/components/EndGameOverlay.vue";
import QuestVotes from "@/components/QuestVotes.vue";
import GameStatus from "@/components/GameStatus.vue";
import PlayerVoteStatus from "@/components/PlayerVoteStatus.vue";
import RoleList from "@/components/RoleList.vue";

export default {
  name: "Game",
  components: {
    LobbyList,
    PlayerCards,
    Chat,
    QuestCards,
    VoteTrack,
    SetupOptions,
    DecideQuestTeam,
    EndGameOverlay,
    QuestVotes,
    GameStatus,
    PlayerVoteStatus,
    RoleList
  },
  data() {
    return {
      yourName: null,
      roomCode: null,
      players: [],
      quests: [],
      optionalCharacters: [],
      challengeMode: "OFF",

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

      showPlayerVoteStatus: false,

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
      console.log(`Data is: ${data}`);
    },
    startGame() {
      console.log(`starting game in room: ${this.roomCode}`);
      //emit startGame with roomcode & optional character choices
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
    //update overall game
    updatePlayers(players) {
      this.players = players;
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
    choosePlayersForQuest(data) {
      this.showAddPlayerButton = data.bool;
      this.showRemovePlayerButton = data.bool;
    },
    //
    togglePlayerVoteStatus(bool) {
      console.log("togglePlayerVoteStatus");
      this.showPlayerVoteStatus = bool;
    },
    updateQuestMsg(msg) {
      this.questMsg = msg;
      this.showQuestMsg = true;
    },
    //etc
    showHostSetupOptions(bool) {
      this.showSetupOptions = bool;
    },
    errorMsg(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.showStartButton = true;
    },

    //assassination time
    beginAssassination(msg) {
      //update player cards to show Assassinate button
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
.main-board {
  background: #eae7e3;
  border-radius: 5px;
  margin: 10px;
  min-height: 40vh;
  padding: 4px !important;
  clear: none;
  box-shadow: 0 2px 5px #c2ab8e;
}
.game-section {
  background: #eae7e3;
  border-radius: 5px;
  padding: 4px !important;
  box-shadow: 0 2px 5px #c2ab8e;
}
</style>
