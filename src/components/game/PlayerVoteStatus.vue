<template>
  <b-row v-if="showPlayerVoteStatus" class="status-section">
    <b-col class="section-title" md="2">Player Votes</b-col>
    <b-col>
      <div v-if="showHasVoted && !showTeamVoteResults">
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
          {{ successCount }}
          <strong>Fail:</strong>
          {{ failCount }}
        </div>
      </div>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: "GameStatus",
  data() {
    return {
      //deciding team
      teamVotes: null,
      showHasVoted: false,
      showPlayerVoteStatus: false,
      showTeamVoteResults: false,

      questVotes: null,

      //deciding outcome of quest
      showHasVotedOnQuest: false,
      showQuestVoteResults: false,
      voted: null,
      successCount: null,
      failCount: null
    };
  },
  props: [],
  sockets: {
    updateConcealedTeamVotes(currentVotes) {
      this.teamVotes = currentVotes.join(", ");
      this.showHasVoted = true;
      this.showTeamVoteResults = false;
      this.showPlayerVoteStatus = true;
    },
    updateConcealedQuestVotes(votes) {
      this.showHasVotedOnQuest = true;
      this.questVotes = votes.join(", ");
    },
    revealTeamVotes(votes) {
      this.teamVotes = votes;
      this.teamVotes.accept = votes.accept.join(", ");
      this.teamVotes.reject = votes.reject.join(", ");
      this.showHasVoted = false;
      this.showTeamVoteResults = true;
    },
    hidePreviousTeamVotes() {
      this.showHasVoted = false;
      this.showTeamVoteResults = false;
    },
    revealQuestResults(votes) {
      this.canVoteOnQuest = false;
      this.showHasVotedOnQuest = false;
      this.successCount = votes.succeed;
      this.failCount = votes.fail;
      this.showQuestVoteResults = true;
    },
    hidePreviousQuestVotes() {
      this.showQuestVoteResults = false;
      this.canVoteOnQuest = false;
    }
  }
};
</script>

<style>
@import "../../styles/styles.css";
</style>