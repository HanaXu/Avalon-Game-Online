<template>
  <div class="row justify-content-md-center playerCards">
    <div class v-bind:class="{'d-flex flex-nowrap': width < 768, 'd-flex flex-wrap': width >= 768}">
      <div
        class="player card"
        :class="{darkerBG: player.name === name}"
        v-for="(player, index) in players"
        :key="index"
      >
        <div
          class="player card-body"
          :class="{markEvil: player.team === 'Evil', markGood: player.team === 'Good', disconnected: player.disconnected === true}"
        >
          <h5 class="card-title">
            {{ player.name }}
            <span style="color: #FFD700" v-if="player.leader">👑</span>

            <span
              v-b-modal="'memo-modal-' + player.name"
              class="float-right"
              style="cursor: pointer"
            >📝</span>
          </h5>
          <MemoModal :playerName="player.name" />

          <h6 class="player card-subtitle text-muted">
            <strong>Team:</strong>
            {{ player.team }}
            <br />
            <strong>Character:</strong>
            {{ player.character }}
            <br />
            <b-badge v-if="player.onQuest" class="questBadge">On Quest</b-badge>
            <p v-if="player.disconnected === true" class="font-italic">Disconnected</p>
          </h6>

          <div v-if="showAddBtn || showRemoveBtn">
            <b-button
              class="mx-1 mt-2 questAddButton"
              :id="'add-player-' + player.name"
              v-if="!player.onQuest && showAddBtn"
              @click="addPlayerToQuest(player.name)"
            >Add to Quest</b-button>
            <b-button
              class="mx-1 mt-1 questRemoveButton"
              :id="'remove-player-' + player.name"
              v-if="player.onQuest && showRemoveBtn"
              @click="removePlayerFromQuest(player.name)"
            >Remove</b-button>
          </div>

          <div v-if="showAssassinateBtn" class="row justify-content-md-center">
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

<style>
@import "../../styles/styles.css";
.disconnected {
  background: #f8d7da !important;
}
</style>
