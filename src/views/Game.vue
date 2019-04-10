<template>
  <div>
    <div class="container text-left" style="margin-top: .5rem">
      <h4>{{ yourName }}, welcome to Avalonline Room: {{ roomCode }}</h4>
    </div>
    <div class="container game">
      <div style="text-align: left; align-items: left; justify-content: left">
        <LobbyList v-if="!assignIdentities" :players="players" :yourName="yourName"/>
      </div>

      <div v-if="showSetupOptions">
        <!-- "ADD BOT" BUTTON WILL GO HERE IN THIS DIV -->
        <b-form-group label="Include optional characters:">
            <b-form-checkbox-group v-model="selected" name="optionalCharacters" :options="optionalCharacters">
            </b-form-checkbox-group>
        </b-form-group>
      </div>


      <div v-if="showStartButton">
        <b-button class="avalon-btn-lg" @click="startGame">Start Game</b-button>
      </div>
      <PlayerCards v-if="assignIdentities" :players="players" :yourName="yourName"/>
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
      showSetupOptions: false,
      assignIdentities: false,
      selected: [],
      optionalCharacters: [
        {text: 'Percival', value: 'percival'},
        {text: 'Mordred', value: 'mordred'},
        {text: 'Oberon', value: 'oberon'},
        {text: 'Morgana', value: 'morgana'}
      ]
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
  height: 75vh;
}
</style>
