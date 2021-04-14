<template>
  <div class="player row justify-content-center">
    <div
      v-for="(player, index) in players"
      :key="index"
      class="card"
      :class="{
          self: player.name === playerName,
          evil: player.team === 'Evil',
          good: player.team === 'Good',
          disconnected: player.disconnected === true}"
    >
      <span v-if="player.assassinated" class="cross-mark">X</span>
      <h5 class="card-title">
        {{ player.name }}
        <span v-if="player.leader">👑</span>
        <span
          v-b-modal="'notes-modal-' + player.name"
          style="cursor: pointer"
          v-b-tooltip.hover.topright="`Notes...`"
        >📝</span>
      </h5>
      <NotesModal :playerName="player.name" />
      <h6 class="card-subtitle text-muted">
        <strong>Team:</strong>
        {{ player.team }}
        <br />
        <strong>Role:</strong>
        {{ player.role }}
        <br />
        <b-badge v-if="player.onQuest" class="avalon-badge">On Quest</b-badge>
        <span v-if="player.disconnected === true" class="font-italic">Disconnected</span>
      </h6>
      <div v-if="showAddRemovePlayerBtns">
        <b-button
          class="mt-2 avalon-btn-primary"
          :id="'add-player-' + player.name"
          v-if="!player.onQuest"
          :disabled="disableAddPlayerBtn"
          @click="addRemovePlayerFromQuest($event, 'add', player.name)"
        >Add to Quest</b-button>
        <b-button
          class="mt-1 avalon-btn-primary"
          :id="'remove-player-' + player.name"
          v-if="player.onQuest"
          @click="addRemovePlayerFromQuest($event, 'remove', player.name)"
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
  computed: mapState(["roomCode", "playerName", "players"]),
  methods: {
    addRemovePlayerFromQuest(event, action, playerName) {
      event.target.blur();
      this.$socket.emit("addRemovePlayerFromQuest", action, playerName);
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
    width: 100px;
  }
  .evil {
    border-top: 5px solid #a42323;
  }
  .good {
    border-top: 5px solid #3c48bb;
  }
  .disconnected {
    background: #f8d7da;
    transition: 0.4s;
  }
  .cross-mark {
    position: absolute;
    line-height: 1;
    color: #a42323;
    font-size: 150px;
    top: 0;
    left: 0;
    animation-name: shrinkIn;
    animation-duration: 0.2s;
  }
}

@media screen and (min-width: 768px) {
  .player {
    .card {
      width: 150px;
    }
    .cross-mark {
    left: 25px;
  }
  }
}

@keyframes shrinkIn {
  0% {
    opacity: 0;
    transform: scale(3);
    animation-timing-function: linear;
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
