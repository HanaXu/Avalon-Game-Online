<template>
  <div>
    <b-row class="section">
      <b-col class="sectionTitle" cols="3" md="2">Player Votes</b-col>
      <b-col>
        <div v-if="showHasVoted && !showTeamVoteResults">
          Voted:
          <strong>{{ teamVotes }}</strong>
        </div>

        <!--all players have voted, show all results-->
        <div v-if="showTeamVoteResults" class="ml-2 text-left">
          <div v-if="teamVotes.reject.length >= teamVotes.accept.length">
            <strong>Accepted:</strong>
            {{ teamVotes.accept }}
            <br>
            <strong>Rejected:</strong>
            {{ teamVotes.reject }}
          </div>
          <div v-if="teamVotes.reject.length < teamVotes.accept.length">
            <!--Quest team was Approved. Waiting for quest team to go on quest.<br>-->

            <strong>Accepted:</strong>
            {{ teamVotes.accept }}
            <br>
            <strong>Rejected:</strong>
            {{ teamVotes.reject }}
          </div>
        </div>

        <!--some of team has voted on quest but not all-->
        <div v-if="showHasVotedOnQuest && !showQuestVoteResults">
          Voted:
          <strong>{{ voted }}</strong>
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