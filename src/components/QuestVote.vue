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

  <div v-if="localShowAcceptRejectButtons">
    <div class="row justify-content-md-center">
      <b-button class="avalon-btn-lg" @click="questTeamDecision('accept')" :disabled="onGoodTeam">Accept Team</b-button>
      <b-button class="avalon-btn-lg" @click="questTeamDecision('reject')">Reject Team</b-button>
    </div>
  </div>


  <div v-if="showSucceedFailButtons">
    <div class="row justify-content-md-center">
      <b-button class="avalon-btn-lg" @click="questDecision('succeed')">Succeed Quest</b-button>
      <b-button class="avalon-btn-lg" @click="questDecision('fail')">Fail Quest</b-button>
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
  watch: {
    showAcceptRejectButtons: function(value) {
      localShowAcceptRejectButtons = value;
    }
  },
  data: function() {
    return {
      showConfirmTeamButton: false,
      showHasVoted: false,
      showTeamVoteResults: false,
      teamVotes: null,
      localShowAcceptRejectButtons: this.showAcceptRejectButtons,
      showSucceedFailButtons: false,
      onGoodTeam: false
    }
  },
  methods: {
    questTeamConfirmed: function() {
      this.showConfirmTeamButton = false;
      this.$socket.emit("questTeamConfirmed");
      this.localShowAcceptRejectButtons = true;
    },
    questTeamDecision: function(decision) {
      this.localShowAcceptRejectButtons = false;
      //this.$socket.emit("toggleAcceptRejectButtons", true);

      this.$socket.emit("questTeamDecision", {
        name: this.yourName,
        decision: decision
      });
    },
    questDecision: function(decision) {
      this.showSucceedFailButtons = false;
    }
  },
  sockets: {
    confirmQuestTeam: function(bool) {
      this.showConfirmTeamButton = bool;
    },
    teamVotes: function(voted) {
      this.teamVotes = voted.join(", "); //make array look nicer
      this.showTeamVoteResults = false;
      this.showHasVoted = true;
    },
    revealTeamVotes: function(votes) {
      this.localShowAcceptRejectButtons = false;
      this.teamVotes = votes;
      this.teamVotes.accept = votes.accept.join(", "); //make array look nicer
      this.teamVotes.reject = votes.reject.join(", ");
      this.showHasVoted = false;
      this.showTeamVoteResults = true;
    },
    hideTeamVotes: function() {
      this.showHasVoted = false;
      this.showTeamVoteResults = false;
    },
    goOnQuest: function(onGoodTeam) {
      this.showSucceedFailButtons = true;
      this.onGoodTeam = data;
    }
  }
};
</script>