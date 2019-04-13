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
  name: "QuestVote",
  props: [
    "showAcceptRejectButtons",
    "yourName"
  ],
  data: function() {
    return {
      showConfirmTeamButton: false,
      showHasVoted: false,
      showTeamVoteResults: false,
      teamVotes: null,
    }
  },
  methods: {
    questTeamConfirmed: function() {
      this.showConfirmTeamButton = false;
      this.$socket.emit("questTeamConfirmed");
    },
    questTeamDecision: function(decision) {
      this.$socket.emit("questTeamDecision", {
        name: this.yourName,
        decision: decision
      });
    }

  },
  sockets: {
    confirmQuestTeam: function(bool) {
      this.showConfirmTeamButton = bool;
    },
    teamVotes: function(voted) {
      this.teamVotes = voted.join(", "); //make array look nicer
      this.showHasVoted = true;
    },
    revealTeamVotes: function(votes) {
      this.showAcceptRejectButtons = false;
      this.teamVotes = votes;
      this.teamVotes.accept = votes.accept.join(", "); //make array look nicer
      this.teamVotes.reject = votes.reject.join(", ");
      this.showHasVoted = false;
      this.showTeamVoteResults = true;
      this.$socket.emit("updateQuestMsg", {"questMsg": "All players have voted on the quest team. Results are:"});
    }
  }
};
</script>