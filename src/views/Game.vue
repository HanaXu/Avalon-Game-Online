<template>
  <div>
    <div class="jumbo" v-if="loading">Loading...</div>
    <div class="container text-left" style="margin-top: .5rem">
      <h4 v-if="!loading">{{ yourName }}, welcome to Avalonline Room: {{ roomCode }}</h4>
    </div>
    <div class="container game" v-if="!loading">
      <div>
        <ul style="list-style-type:none;">
          <li
            style="font-size: 27px;"
            v-for="(player, index) in players"
            :key="index"
          >{{ player.role }}: {{ player.name }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game {
  height: 80vh;
  display: flex;
  justify-content: left;
  text-align: left;
  background: #777;
  border-radius: 3px;
}
ul {
  margin-top: 1rem;
  padding: 0;
}
li {
  padding-left: 1.5rem;
}
</style>

<script>
export default {
  name: "Game",
  data() {
    return {
      loading: true,
      message: null,
      players: [],
      yourName: null,
      roomCode: null
    };
  },
  created() {
    this.yourName = this.$route.params.yourName;
    console.log(yourName)
  },
  sockets: {
    connect: function() {
      console.log("socket connected");
    },
    updatePlayers: function(data) {
      this.loading = false;
      this.roomCode = data["roomCode"];
      this.players = data["players"];

      //   console.log("you are: " + this.yourName);
      console.log("roomCode: " + this.roomCode);
    }
  }
};
</script>