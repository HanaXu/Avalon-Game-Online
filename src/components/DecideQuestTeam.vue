<template>
  <div>
    <div v-if="showConfirmTeamButton">
      <b-button class="avalon-btn-lg" id="confirm-team-btn" @click="questTeamConfirmed">Confirm Team</b-button>
    </div>

    <div v-if="showAcceptRejectButtons">
      <div class="row justify-content-center">
        <b-button
          class="avalon-btn-lg"
          id="accept-team-btn"
          @click="questTeamDecision('accept')"
        >Accept Team</b-button>
        <b-button
          class="avalon-btn-lg"
          id="reject-team-btn"
          @click="questTeamDecision('reject')"
        >Reject Team</b-button>
      </div>
    </div>


  </div>
</template>

<script>
export default {
  name: "DecideQuestTeam",
  data() {
    return {
      showConfirmTeamButton: false,
      showAcceptRejectButtons: false,
      teamVotes: null,
      showHasVoted: false,
      showTeamVoteResults: false
    };
  },
  props: [
    "yourName"
  ],
  methods: {
    questTeamConfirmed() {
      this.$socket.emit("questTeamConfirmed");
    },
    questTeamDecision(decision) {
      this.$socket.emit("questTeamDecision", {
        name: this.yourName,
        decision: decision
      });
    }
  },
  sockets: {
    confirmQuestTeam(bool) {
      this.showConfirmTeamButton = bool;
    },
    acceptOrRejectTeam(bool) {
      this.showAcceptRejectButtons = bool;
    }
  }
};
</script>

