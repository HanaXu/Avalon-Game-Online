<template>
<div>
  <b-row class="section">
    <b-col class="sectionTitle" cols="3" md="2">Player Votes</b-col>
   <b-col>
      <!--players have begun to vote on quest team, but have not all confirmed yet-->
          <div v-if="showHasVoted && !showTeamVoteResults">
            Voted:
            <strong>{{ teamVotes }}</strong>
          </div>
      <!--all players have voted, show all results-->
          <div v-if="showTeamVoteResults" class="mt-2">
            <div v-if="teamVotes.reject.length >= teamVotes.accept.length">
              Quest team was Rejected. New quest leader has been chosen.
              <br>
              <strong>Accepted:</strong>
              {{ teamVotes.accept }}
              <br>
              <strong>Rejected:</strong>
              {{ teamVotes.reject }}
            </div>
            <div v-if="teamVotes.reject.length < teamVotes.accept.length">
              Quest team was Approved. Waiting for quest team to go on quest.
              <br>
              <strong>Accepted:</strong>
              {{ teamVotes.accept }}
              <br>
              <strong>Rejected:</strong>
              {{ teamVotes.reject }}
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
      teamVotes: null,
      showHasVoted: false,
      showTeamVoteResults: false
    }
  },
  props: [
  ],
  sockets: {
    votedOnTeam(votes) {
      this.$socket.emit('togglePlayerVoteStatus', true);
      this.teamVotes = votes.join(", ");
      this.showHasVoted = true;
      this.showTeamVoteResults = false;
    },
    revealTeamVotes(votes) {
      this.$socket.emit('togglePlayerVoteStatus', true);
      this.teamVotes = votes;
      this.teamVotes.accept = votes.accept.join(", "); //make array look nicer
      this.teamVotes.reject = votes.reject.join(", ");
      this.showHasVoted = false;
      this.showTeamVoteResults = true;
    },
    hideTeamVotes() {
      this.$socket.emit('togglePlayerVoteStatus', false);
      this.showHasVoted = false;
      this.showTeamVoteResults = false;
    }
  }
}
</script>
<style>
@import '../styles/styles.css';

</style>