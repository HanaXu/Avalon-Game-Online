<template>
  <div class="player row justify-content-center">
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
        <span v-b-modal="'notes-modal-' + player.name" style="cursor: pointer">📝</span>
      </h5>
      <NotesModal :playerName="player.name" />
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
      <div v-if="showAddRemovePlayerBtns">
        <b-button
          class="mt-2 avalon-btn-primary"
          :id="'add-player-' + player.name"
          v-if="!player.onQuest"
          :disabled="disableAddPlayerBtn"
          @click="addPlayerToQuest($event, player.name)"
        >Add to Quest</b-button>
        <b-button
          class="mt-1 avalon-btn-primary"
          :id="'remove-player-' + player.name"
          v-if="player.onQuest"
          @click="removePlayerFromQuest($event, player.name)"
        >Remove</b-button>
      </div>
      <div v-if="showAssassinateBtn && !(player.team === 'Evil')">
        <b-button
          class="mt-1 avalon-btn-primary"
          :id="'assassinate-' + player.name"
          @click="assassinatePlayer(player.name)"
        >Assassinate</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import NotesModal from "@/components/game/NotesModal.vue";
import { mapState } from "vuex";

export default {
  name: "PlayerCards",
  components: {
    NotesModal
  },
  data() {
    return {
      showAddRemovePlayerBtns: false,
      disableAddPlayerBtn: false,
      showAssassinateBtn: false
    };
  },
  computed: mapState(["name", "players"]),
  methods: {
    addPlayerToQuest(event, playerName) {
      event.target.blur();
      this.$socket.emit("addPlayerToQuest", playerName);
    },
    removePlayerFromQuest(event, playerName) {
      event.target.blur();
      this.$socket.emit("removePlayerFromQuest", playerName);
    },
    assassinatePlayer(playerName) {
      this.$socket.emit("assassinatePlayer", playerName);
    }
  },
  sockets: {
    showAddRemovePlayerBtns(showAddRemovePlayerBtns) {
      this.showAddRemovePlayerBtns = showAddRemovePlayerBtns;
    },
    showConfirmTeamBtnToLeader(showConfirmTeamBtn) {
      this.disableAddPlayerBtn = showConfirmTeamBtn;
    },
    showAssassinateBtn(showAssassinateBtn) {
      this.showAssassinateBtn = showAssassinateBtn;
    }
  }
};
</script>

<style lang="scss">
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
