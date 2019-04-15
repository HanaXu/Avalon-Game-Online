<template>
  <div>
    <div v-if="showConfirmTeamButton">
      <b-button class="avalon-btn-lg" id="confirm-team-btn" @click="questTeamConfirmed">Confirm Team</b-button>
    </div>

    <div v-if="showHasVoted && !showTeamVoteResults">
      Voted:
      <strong>{{ teamVotes }}</strong>
    </div>

    <div v-if="showAcceptRejectButtons">
      <div class="row justify-content-md-center">
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

    <div v-if="showTeamVoteResults">
      <b-alert
        v-if="teamVotes.reject.length > teamVotes.accept.length"
        show
        variant="danger"
      >Quest team was Rejected. New quest leader has been chosen.</b-alert>
      <b-alert
        v-if="teamVotes.reject.length <= teamVotes.accept.length"
        show
        variant="success"
      >Quest team was Approved. Waiting for quest team to go on quest.</b-alert>
      <strong>Vote Results:</strong>
      <br>
      <strong>Accepted:</strong>
      {{ teamVotes.accept }}
      <br>
      <strong>Rejected:</strong>
      {{ teamVotes.reject }}
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
  props: ["yourName"],
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
    },
    votedOnTeam(votes) {
      this.teamVotes = votes.join(", ");
      this.showHasVoted = true;
      this.showTeamVoteResults = false;
    },
    revealTeamVotes(votes) {
      this.teamVotes = votes;
      this.teamVotes.accept = votes.accept.join(", "); //make array look nicer
      this.teamVotes.reject = votes.reject.join(", ");
      this.showHasVoted = false;
      this.showTeamVoteResults = true;
    }
  }
};
</script>

