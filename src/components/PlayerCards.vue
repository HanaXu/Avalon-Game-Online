<template>
  <div class="row justify-content-md-center playerCards" >
    <div class="" v-bind:class="{'d-flex flex-nowrap': width < 768, 'd-flex flex-wrap': width >= 768}">
      <div
        class="player card"
        :class="{darkerBG: player.name === yourName}"
        v-for="(player, index) in players"
        :key="index"
      >
        <div
          class="player card-body"
          :class="{markEvil: player.team === 'Evil', markGood: player.team === 'Good'}"
        >
          <h5 class="card-title">
            {{ player.name }}
            <span style="color: #FFD700" v-if="player.leader">👑</span>
          </h5>
          <h6 class=" player card-subtitle text-muted">
            <b>Team:</b>
            {{ player.team }}
            <br>
            <b>Character:</b>
            {{ player.character }}
            <br>
            <b-badge v-if="player.onQuest" class="questBadge">On Quest</b-badge>
          </h6>
          <div
            v-if="showAddPlayerButton || showRemovePlayerButton"
            class="row justify-content-md-center"
          >
            <b-button
              class="mx-1 mt-2 questAddButton"
              :id="'add-player-' + player.name"
              v-if="!player.onQuest && showAddPlayerButton"
              @click="addPlayerToQuest(player.name)"
            >Add to Quest</b-button>
            <b-button
              class="mx-1 mt-1 questRemoveButton"
              :id="'remove-player-' + player.name"
              v-if="player.onQuest && showRemovePlayerButton"
              @click="removePlayerFromQuest(player.name)"
            >Drop from Quest</b-button>
          </div>

          <div v-if="assassination" class="row justify-content-md-center">
            <b-button
              class="mx-1 mt-1"
              :id="'assassinate-' + player.name"
              v-if="player.team === 'good' || player.team === 'hidden'"
              @click="assassinatePlayer(player.name)"
            >Assassinate</b-button>
          </div>
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
  data() {
    return {
      width : window.innerWidth

    }
  },
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
@import '../styles/styles.css';
</style>
