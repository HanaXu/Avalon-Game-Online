<template>
  <div>
    <div class="container text-left" style="margin-top: .5rem">
      <h4>{{ yourName }}, welcome to Avalonline Room: {{ roomCode }}</h4>
    </div>
    <div class="container game">
      <div style="text-align: left; align-items: left; justify-content: left">
        <LobbyList v-if="!gameStarted" :players="players" :yourName="yourName"/>
      </div>
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
      <div v-if="gameStarted" class="row justify-content-md-center" style="padding: 1rem;">
        <span class="text-light">{{ questMsg }}</span>
      </div>
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
      questMsg: null,
      yourName: null,
      roomCode: null,
      showStartButton: false,
      gameStarted: false,
      showAddPlayerButton: false,
      showRemovePlayerButton: false
    };
  },
  created() {
    this.yourName = this.$route.params.yourName;
    this.roomCode = this.$route.params.roomCode;
  },
  methods: {
    startGame: function() {
      console.log("starting game in room: " + this.roomCode);
      this.$socket.emit("startGame", this.roomCode);
      this.showStartButton = false;
    }
  },
  sockets: {
    updatePlayers: function(data) {
      this.players = data["players"];
    },
    updateQuests: function(data) {
      this.quests = data["quests"];
      // this.currentQuestNum = data["currentQuestNum"];
    },
    updateVoteTrack: function(data) {
      this.currentVoteTrack = data["voteTrack"];
    },
    gameReady: function() {
      this.showStartButton = true;
    },
    gameStarted: function() {
      this.gameStarted = true;
    },
    ChoosePlayersForQuest: function() {
      this.showAddPlayerButton = true;
      this.showRemovePlayerButton = true;
    },
    updateQuestMsg: function(data) {
      this.questMsg = data["questMsg"];
      console.log(this.questMsg);
    }
  }
};
</script>

<style>
.game {
  background: #777;
  border-radius: 3px;
  height: 75vh;
}
</style>
