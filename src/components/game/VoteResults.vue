<template>
  <b-row v-if="showTeamVoteResults || showQuestVoteResults" class="status-section">
    <b-col class="section-title" md="2">Vote Results</b-col>
    <b-col>
      <!--all players have voted, show vote results-->
      <div
        v-if="showTeamVoteResults && !showQuestVoteResults"
        class="row my-0 justify-content-center"
      >
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
        <div class="col-md-3 py-1">
          <b-progress show-value :max="questVotes.succeed + questVotes.fail">
            <b-progress-bar
              class="bg--success"
              :value="questVotes.succeed"
            >Success: {{questVotes.succeed}}</b-progress-bar>
            <b-progress-bar class="bg--danger" :value="questVotes.fail">Fail: {{questVotes.fail}}</b-progress-bar>
          </b-progress>
        </div>
      </div>
    </b-col>
  </b-row>
</template>

<script>
export default {
  data() {
    return {
      teamVotes: null,
      showTeamVoteResults: false,

      questVotes: null,
      showQuestVoteResults: false
    };
  },
  sockets: {
    revealVoteResults({ type, votes }) {
      switch (type) {
        case "team":
          this.teamVotes = votes;
          this.showTeamVoteResults = true;
          break;
        case "quest":
          this.questVotes = votes;
          this.showQuestVoteResults = true;
          break;
      }
    },
    hidePreviousVoteResults() {
      this.showTeamVoteResults = false;
      this.showQuestVoteResults = false;
    }
  }
};
</script>

<style>
.bg--danger {
  background: #a42323 !important;
}
.bg--success {
  background: #3c48bb !important;
}
</style>