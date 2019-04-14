<template>
  <div>
    <div v-if="showConfirmTeamButton">
      <b-button class="avalon-btn-lg" @click="questTeamConfirmed">Confirm Team</b-button>
    </div>

    <div v-if="showHasVoted && !showTeamVoteResults">
      Voted:
      <strong>{{ teamVotes }}</strong>
    </div>
    <div v-if="showTeamVoteResults">
      <span
        v-if="teamVotes.reject.length > teamVotes.accept.length"
      >Vote Results: Quest team was Rejected. New quest leader has been chosen.</span>
      <br>
      <strong>Accepted:</strong>
      {{ teamVotes.accept }}
      <br>
      <strong>Rejected:</strong>
      {{ teamVotes.reject }}
    </div>

    <div v-if="showAcceptRejectButtons">
      <div class="row justify-content-md-center">
        <b-button class="avalon-btn-lg" @click="questTeamDecision('accept')">Accept Team</b-button>
        <b-button class="avalon-btn-lg" @click="questTeamDecision('reject')">Reject Team</b-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "QuestTeamVotes",
  props: [
    "showConfirmTeamButton",
    "yourName",
    "showHasVoted",
    "showTeamVoteResults",
    "teamVotes",
    "showAcceptRejectButtons"
  ],
  methods: {
    questTeamConfirmed: function() {
      this.$socket.emit("questTeamConfirmed");
    },
    questTeamDecision: function(decision) {
      this.$socket.emit("questTeamDecision", {
        name: this.yourName,
        decision: decision
      });
    }
  }
};
</script>

