<template>
  <div>
    <!-- <div class="jumbo" v-if="loading">Loading...</div> -->
    <div class="container text-left" style="margin-top: .5rem">
      <h4>{{ yourName }}, welcome to Avalonline Room: {{ roomCode }}</h4>
    </div>
    <div class="container game">
      <div style="text-align: left; align-items: left; justify-content: left">
        <LobbyList v-if="!assignIdentities" :players="players"/>
      </div>
      <div v-if="showStartButton">
        <b-button class="avalon-btn-lg" @click="startGame">Start Game</b-button>
      </div>
      <PlayerCards v-if="assignIdentities" :players="players"/>
    </div>
  </div>
</template>

<script>
import LobbyList from "@/components/LobbyList.vue";
import PlayerCards from "@/components/PlayerCards.vue";

export default {
  name: "Game",
  components: {
    LobbyList,
    PlayerCards
  },
  data() {
    return {
      players: [],
      yourName: null,
      roomCode: null,
      showStartButton: false,
      assignIdentities: false
    };
  },
  created() {
    this.yourName = this.$route.params.yourName;
    this.roomCode = this.$route.params.roomCode;
    console.log("roomcode is: " + this.roomCode);
  },
  methods: {
    startGame: function() {
      console.log("starting game in room: " + this.roomCode);
      this.$socket.emit("startGame", this.roomCode);
      this.assignIdentities = true;
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
