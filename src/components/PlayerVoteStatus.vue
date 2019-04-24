<template>
  <div>
    <b-row class="section">
      <b-col class="sectionTitle" cols="3" md="2">Player Votes</b-col>
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
            <br>
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
          <div class="col-6 col-md-3">
            <strong>Quest Vote Results:</strong>
          </div>
          <div class="col-6 col-md-2 text-left">
            <strong>Succeed:</strong>
            {{ successCount }}
            <br>
            <strong>Fail:</strong>
            {{ failCount }}
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: "GameStatus",
  data() {
    return {
      //deciding team
      teamVotes: null,
      showHasVoted: false,
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
    votedOnTeam(votes) {
      console.log("votedOnTeam()");
      //this.$socket.emit('togglePlayerVoteStatus', true);
      this.teamVotes = votes.join(", ");
      this.showHasVoted = true;
      this.showTeamVoteResults = false;
    },
    votedOnQuest(votes) {
      this.showHasVotedOnQuest = true;
      this.questVotes = votes.join(", ");
    },
    revealTeamVotes(votes) {
      //this.$socket.emit('togglePlayerVoteStatus', true);
      this.teamVotes = votes;
      this.teamVotes.accept = votes.accept.join(", "); //make array look nicer
      this.teamVotes.reject = votes.reject.join(", ");
      this.showHasVoted = false;
      this.showTeamVoteResults = true;
    },
    hideTeamVotes() {
      //this.$socket.emit('togglePlayerVoteStatus', false);
      this.showHasVoted = false;
      this.showTeamVoteResults = false;
    },
    revealVotes(data) {
      this.canVoteOnQuest = false;
      this.showHasVotedOnQuest = false;
      this.successCount = data["success"];
      this.failCount = data["fail"];
      this.showQuestVoteResults = true;
    },
    hideVotes() {
      this.showQuestVoteResults = false;
      this.canVoteOnQuest = false;
    }
  }
};
</script>

<style>
@import "../styles/styles.css";
</style>