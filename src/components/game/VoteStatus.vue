<template>
  <b-row v-if="showHasVotedOnTeam || showHasVotedOnQuest" class="status-section">
    <b-col class="section-title" md="2">Vote Status</b-col>
    <b-col>
      <div v-if="showHasVotedOnTeam && !showTeamVoteResults">
        <strong>Voted:</strong>
        {{ teamVotes }}
      </div>
      <!--all players have voted, show all results-->
      <div v-if="showTeamVoteResults" class="row my-0 justify-content-center">
        <div class="col-md-6 col-12 text-left">
          <strong>Accepted Team:</strong>
          {{ teamVotes.accept }}
          <br />
          <strong>Rejected Team:</strong>
          {{ teamVotes.reject }}
        </div>
        <!--some of team has voted on quest but not all-->
        <div class="col-md-4 col-12 mt-2 text-left">
          <div v-if="showHasVotedOnQuest && !showQuestVoteResults">
            <strong>Went on quest:</strong>
            {{ questVotes }}
          </div>
        </div>
      </div>
      <!--all of quest team has voted-->
      <div class="row justify-content-center" v-if="showQuestVoteResults">
        <div class="col-md-2">
          <strong>Quest Results:</strong>
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
      showHasVotedOnTeam: false,
      showTeamVoteResults: false,

      //deciding outcome of quest
      questVotes: null,
      showHasVotedOnQuest: false,
      showQuestVoteResults: false
    };
  },
  sockets: {
    updateConcealedTeamVotes(currentVotes) {
      this.teamVotes = currentVotes.join(", ");
      this.showHasVotedOnTeam = true;
      this.showTeamVoteResults = false;
      this.showQuestVoteResults = false;
    },
    updateConcealedQuestVotes(votes) {
      this.showHasVotedOnQuest = true;
      this.questVotes = votes.join(", ");
    },
    revealTeamVotes(votes) {
      this.teamVotes = votes;
      this.teamVotes.accept = votes.accept.join(", ");
      this.teamVotes.reject = votes.reject.join(", ");
      this.showHasVotedOnTeam = false;
      this.showTeamVoteResults = true;
    },
    revealQuestVotes(votes) {
      this.questVotes = votes;
      this.showHasVotedOnQuest = false;
      this.showHasVotedOnTeam = false;
      this.showQuestVoteResults = true;
    }
  }
};
</script>