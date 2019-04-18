<template>
  <div>
    <div class="row justify-content-md-center" v-if="canVoteOnQuest">
      <b-button class="avalon-btn-lg" id="succeed-btn" @click="questVote('succeed')">Succeed</b-button>
      <b-button
        class="avalon-btn-lg"
        id="fail-btn"
        @click="questVote('fail')"
        :disabled="onGoodTeam"
      >Fail</b-button>
    </div>

    <div v-if="showHasVotedOnQuest && !showQuestVoteResults">
      Voted:
      <strong>{{ votes }}</strong>
    </div>

    <div v-if="showQuestVoteResults">
      <b-alert v-if="votes.fail > 0" show variant="danger">
        <strong>Quest Vote Results:</strong>
        <br>
        <strong>Succeed:</strong>
        {{ votes.succeed }}
        <br>
        <strong>Fail:</strong>
        {{ votes.fail }}
      </b-alert>

      <b-alert v-if="votes.fail == 0" show variant="success">
        <strong>Quest Vote Results:</strong>
        <br>
        <strong>Succeed:</strong>
        {{ votes.succeed }}
        <br>
        <strong>Fail:</strong>
        {{ votes.fail }}
      </b-alert>
    </div>
  </div>
</template>

<script>
export default {
  name: "QuestVotes",
  props: ["yourName"],
  data() {
    return {
      canVoteOnQuest: false,
      onGoodTeam: false,
      showHasVotedOnQuest: false,
      showQuestVoteResults: false,
      votes: null
    };
  },
  methods: {
    questVote(decision) {
      this.canVoteOnQuest = false;

      this.$socket.emit("questVote", {
        name: this.yourName,
        decision: decision
      });
    }
  },
  sockets: {
    goOnQuest(bool) {
      this.canVoteOnQuest = true;
      this.onGoodTeam = bool;
    },
    votedOnQuest(votes) {
      this.votes = votes.join(", ");
      this.showHasVotedOnQuest = true;
      this.showQuestVoteResults = false;
    },
    revealVotes(data) {
      this.canVoteOnQuest = false;
      this.showHasVotedOnQuest = false;
      this.showQuestVoteResults = true;
      this.votes = data;
    },
    hideVotes() {
      this.showQuestVoteResults = false;
      this.canVoteOnQuest = false;
    }
  }
};
</script>