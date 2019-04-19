<template>
  <div class="row justify-content-md-center" style="padding: 1rem;">
    <div
      class="card"
      :class="{darkerBG: player.name === yourName}"
      v-for="(player, index) in players"
      :key="index"
    >
      <div
        class="card-body"
        :class="{markRed: player.team === 'Evil', markGreen: player.team === 'Good'}"
      >
        <h5 class="card-title">
          {{ player.role }}: {{ player.name }}
          <span style="color: #FFD700" v-if="player.leader">👑</span>
        </h5>
        <h6 class="card-subtitle mb-2 text-muted">
          <b>Team:</b>
          {{ player.team }}
          <br>
          <b>Character:</b>
          {{ player.character }}
          <br>
          <b-badge v-if="player.onQuest" variant="success" class="questBadge">On Quest</b-badge>
        </h6>
        <div
          v-if="showAddPlayerButton || showRemovePlayerButton"
          class="row justify-content-md-center"
        >
          <b-button
            variant="success"
            class="mx-1"
            :id="'add-player-' + player.name"
            v-if="!player.onQuest && showAddPlayerButton"
            @click="addPlayerToQuest(player.name)"
          >Add to Quest</b-button>
          <b-button
            variant="danger"
            class="mx-1"
            :id="'remove-player-' + player.name"
            v-if="player.onQuest && showRemovePlayerButton"
            @click="removePlayerFromQuest(player.name)"
          >Drop from Quest</b-button>
        </div>

        <div
          v-if="assassination"
          class="row justify-content-md-center"
        >
          <b-button
            variant="danger"
            class="mx-1"
            :id="'assassinate-' + player.name"
            v-if="player.team === 'good' || player.team === 'hidden'"
            @click="assassinatePlayer(player.name)"
          >Assassinate</b-button>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlayerCards",
  props: [
    "players",
    "yourName",
    "showAddPlayerButton",
    "showRemovePlayerButton",
    "assassination"
  ],
  methods: {
    addPlayerToQuest(playerName) {
      this.$socket.emit("addPlayerToQuest", playerName);
    },
    removePlayerFromQuest(playerName) {
      this.$socket.emit("removePlayerFromQuest", playerName);
    },
    assassinatePlayer(playerName) {
      this.$socket.emit("assassinatePlayer", playerName);
    }
  }
};
</script>

<style>
.markRed {
  border-top: 5px solid red;
}
.markGreen {
  border-top: 5px solid green;
}
.questBadge {
  margin: 0.5rem;
}
.card-body {
  padding: 0.5rem 1rem;
}
.card {
  background: #f8f9fa; /* bootstrap 4 bg-light*/
  margin: 5px;
  width: 12rem;
}
.darkerBG {
  background: lightsteelblue !important;
}
.card .card-body {
  margin: 5px;
}
</style>
