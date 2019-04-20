<template>
<div>
<span id="roomCode" style="display:none">{{ roomCode }}</span>


<div class="row justify-content-md-center mx-0">
<div class="col col-12 col-md-8">
  <EndGameOverlay/>

  <div class="container gameSection" v-if="!gameStarted" >

          <b-row>
            <b-col cols="10">
              <div style="text-align: left;">
                <LobbyList :players="players"/>
              </div>
            </b-col>
            <b-col>
              <b-button class="setupButton" v-b-modal.setupModal v-if="showSetupOptions">Setup Options</b-button>
            </b-col>
          </b-row>

        <SetupOptions @clicked="clickedSetupOptions" :roomCode="roomCode"></SetupOptions>
        <!--<b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>-->
        <div v-if="showStartButton">
          <b-button class="avalon-btn-lg" id="start-game-btn" @click="startGame">Start Game</b-button>
        </div>
  </div>

  <div class="container gameSection">
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

  <div class="container gameSection">
        <GameStatus v-if="(showQuestMsg && questMsg.length > 0) || error" :errorMsg="errorMsg" :questMsg="questMsg" />
        <PlayerVoteStatus v-if="showPlayerVoteStatus" />
  </div>

  <div class="container gameSection">
        <QuestVotes :yourName="yourName"/>
        <DecideQuestTeam :yourName="yourName"/>
  </div>


</div>

<div class="col col-12 col-md-4">
  <div class="container chat">
    <div style="align: right">
      <Chat :your-name="yourName" :room-code="roomCode"></Chat>
    </div>
  </div>
</div>

</div>


    <b-navbar class="navbar-default footer" fixed="bottom">
      Show Chat
    </b-navbar>
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
import GameStatus from "@/components/GameStatus.vue";
import PlayerVoteStatus from "@/components/PlayerVoteStatus.vue";

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

</style>
