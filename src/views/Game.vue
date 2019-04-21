<template>
  <div>
<<<<<<< HEAD
    <div class="container text-left" style="margin-top: .5rem">
      <h4>
        {{ yourName }}, welcome to Avalonline Room:
        <span id="roomCode">{{ roomCode }}</span>
      </h4>
    </div>

=======
>>>>>>> b79c119030c0fccce5de39c317e441b5d1005200
    <div class="row justify-content-md-center mx-0">
      <div class="container game col-8">
        <EndGameOverlay/>
<<<<<<< HEAD
        <b-row>
          <b-col cols="10">
            <div style="text-align: left;">
              <LobbyList v-if="!gameStarted" :players="players"/>
            </div>
          </b-col>
          <b-col>
            <b-button class="setupButton" v-b-modal.setupModal v-if="showSetupOptions">Setup Options</b-button>
            <b-button v-if="!gameStarted" class="setupButton" @click="createBot">Add Bot</b-button>
          </b-col>
        </b-row>

        <SetupOptions @clicked="clickedSetupOptions"></SetupOptions>

        <b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>

        <div v-if="showStartButton">
          <b-button class="avalon-btn-lg" id="start-game-btn" @click="startGame">Start Game</b-button>
=======

        <div class="container main-board" v-if="!gameStarted">
          <h4>
            Welcome, {{ yourName }}, to game room
            <span id="roomCode">{{ roomCode }}</span>.
          </h4>
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
>>>>>>> b79c119030c0fccce5de39c317e441b5d1005200
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
<<<<<<< HEAD
        <QuestCards v-if="gameStarted" :quests="quests"/>
        <VoteTrack v-if="gameStarted" :currentVoteTrack="currentVoteTrack"/>
=======
>>>>>>> b79c119030c0fccce5de39c317e441b5d1005200
      </div>

      <div class="col-12 col-md-3">
        <div class="container chat">
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
import LobbyList from "@/components/LobbyList.vue";
import PlayerCards from "@/components/PlayerCards.vue";
import Chat from "@/components/Chat.vue";
import QuestCards from "@/components/QuestCards.vue";
import VoteTrack from "@/components/VoteTrack.vue";
import SetupOptions from "@/components/SetupOptions.vue";
import DecideQuestTeam from "@/components/DecideQuestTeam.vue";
import EndGameOverlay from "@/components/EndGameOverlay.vue";
import QuestVotes from "@/components/QuestVotes.vue";
<<<<<<< HEAD
import { constants } from "crypto";
=======
import GameStatus from "@/components/GameStatus.vue";
import PlayerVoteStatus from "@/components/PlayerVoteStatus.vue";
>>>>>>> b79c119030c0fccce5de39c317e441b5d1005200

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
    PlayerVoteStatus
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
<<<<<<< HEAD
    },
    createBot() {
      console.log(`CreateBot function Called with room: ${this.roomCode}`);
      this.$socket.emit("createBot", this.roomCode);
=======
>>>>>>> b79c119030c0fccce5de39c317e441b5d1005200
    }
  },
  sockets: {
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
</style>
