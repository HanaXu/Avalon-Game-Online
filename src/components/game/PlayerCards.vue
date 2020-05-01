<template>
  <div class="player row justify-content-center mt-2">
    <div
      v-for="(player, index) in players"
      :key="index"
      class="card"
      :class="{
          self: player.name === name,
          evil: player.team === 'Evil',
          good: player.team === 'Good',
          disconnected: player.disconnected === true}"
    >
      <h5 class="card-title">
        {{ player.name }}
        <span v-if="player.leader">👑</span>
        <span v-b-modal="'memo-modal-' + player.name" style="cursor: pointer">📝</span>
      </h5>
      <MemoModal :playerName="player.name" />
      <h6 class="card-subtitle text-muted">
        <strong>Team:</strong>
        {{ player.team }}
        <br />
        <strong>Character:</strong>
        {{ player.character }}
        <br />
        <b-badge v-if="player.onQuest" class="questBadge">On Quest</b-badge>
        <span v-if="player.disconnected === true" class="font-italic">Disconnected</span>
      </h6>
      <div v-if="showAddBtn || showRemoveBtn">
        <b-button
          class="mt-2 addBtn"
          :id="'add-player-' + player.name"
          v-if="!player.onQuest && showAddBtn"
          @click="addPlayerToQuest(player.name)"
        >Add to Quest</b-button>
        <b-button
          class="mt-1 removeBtn"
          :id="'remove-player-' + player.name"
          v-if="player.onQuest && showRemoveBtn"
          @click="removePlayerFromQuest(player.name)"
        >Remove</b-button>
      </div>
      <div v-if="showAssassinateBtn && !(player.team === 'Evil')">
        <b-button
          class="mt-1"
          :id="'assassinate-' + player.name"
          @click="assassinatePlayer(player.name)"
        >Assassinate</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import MemoModal from "@/components/game/MemoModal.vue";
import { mapState } from "vuex";

export default {
  name: "PlayerCards",
  components: {
    MemoModal
  },
  props: ["showAddBtn", "showRemoveBtn", "showAssassinateBtn"],
  data() {
    return {
      width: window.innerWidth
    };
  },
  computed: mapState(["name", "players"]),
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

<style lang="scss">
@import "../../styles/styles.css";
.player {
  .card {
    background: #f8f9fa; /* bootstrap 4 bg-light*/
    box-shadow: 2px 2px 5px #c2ab8e;
    padding: 8px;
    margin: 5px;
    border: none;
    border-radius: 0 0 0.25rem 0.25rem;
    width: 150px;
  }
  .evil {
    border-top: 5px solid #a42323;
  }
  .good {
    border-top: 5px solid #3c48bb;
  }
  .questBadge {
    margin: 0.25rem;
    background: #7d67aa;
  }
  .disconnected {
    background: #f8d7da;
  }
  .addBtn,
  .removeBtn:hover,
  .removeBtn:focus,
  .removeBtn:active {
    color: #ccc351;
    background: #685035;
  }
  .removeBtn,
  .addBtn:hover,
  .addBtn:focus,
  .addBtn:active {
    color: #685035;
    background: #ccc351;
    border-color: #ccc351;
  }
}

/****MOBILE SCREENS****/
@media screen and (max-width: 425px) {
  .player {
    .card {
      width: 90px;
      padding: 2px;
    }
  }
}
</style>
