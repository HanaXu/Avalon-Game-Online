<template>
  <div class="game">
    <div class="jumbo" v-if="loading">Loading...</div>
    <div class="container" v-if="!loading">
      <div class="col">
        <ul style="list-style-type:none;">
          <li
            style="font-size: 27px;"
            v-for="player in players"
            :key="player.socketID"
          >{{ player.role }}: {{ player.name }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin-top: 1rem;
  height: 80vh;
  background: #777;
  border-radius: 3px;
  display: flex;
  justify-content: left;
  text-align: left;
}
ul {
  margin-top: 1rem;
  padding: 0;
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
      yourName: null
    };
  },
  sockets: {
    connect: function() {
      console.log("socket connected");
    },
    updatePlayers: function(data) {
      this.loading = false;
      this.yourName = data["yourName"];
      this.players = data["players"];

      console.log("you are: " + this.yourName);
      console.log("players: " + this.players);
    }
  }
};
</script>