<template>
  <b-row v-if="showTeamVoteResults || showQuestVoteResults" class="status-section">
    <b-col class="section-title" md="2">Vote Status</b-col>
    <b-col>
      <!--all players have voted, show vote results-->
      <div v-if="showTeamVoteResults && !showQuestVoteResults" class="row my-0 justify-content-center">
        <div class="text-left">
          <strong>Accepted Team:</strong>
          {{ teamVotes.accept.join(", ") }}
          <br />
          <strong>Rejected Team:</strong>
          {{ teamVotes.reject.join(", ") }}
        </div>
      </div>
      <!--all of quest team has voted-->
      <div class="row justify-content-center" v-if="showQuestVoteResults">
        <div class="col-md-2">
          <strong>Quest {{questVotes.questNum}} results:</strong>
        </div>
        <div class="col-md-3">
          <strong>Succeed:</strong>
          {{ questVotes.succeed }}
          <strong>Fail:</strong>
          {{ questVotes.fail }}
        </div>
      </div>
    </b-col>
  </b-row>
</template>

<script>
export default {
  data() {
    return {
      //deciding team
      teamVotes: null,
      showTeamVoteResults: false,

      //deciding outcome of quest
      questVotes: null,
      showQuestVoteResults: false
    };
  },
  sockets: {
    revealTeamVotes(votes) {
      this.teamVotes = votes;
      this.showTeamVoteResults = true;
    },
    revealQuestVotes(votes) {
      this.questVotes = votes;
      this.showQuestVoteResults = true;
    },
    hidePreviousVotes() {
      this.showTeamVoteResults = false;
      this.showQuestVoteResults = false;
    }
  }
};
</script>