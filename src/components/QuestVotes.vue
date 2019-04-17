<template>
  <div>
    <div class="row justify-content-md-center" v-if="canVoteOnQuest">
      <b-button class="avalon-btn-lg" @click="questVote('succeed')">Succeed</b-button>
      <b-button class="avalon-btn-lg" @click="questVote('fail')" :disabled="onGoodTeam">Fail</b-button>
    </div>

    <div v-if="showQuestVoteResults">
      <b-alert v-if="voteFail > 0" show variant="danger">
        <strong>Quest Vote Results:</strong>
        <br>
        <strong>Succeed:</strong>
        {{ voteSucceed }}
        <br>
        <strong>Fail:</strong>
        {{ voteFail }}
      </b-alert>

      <b-alert v-if="voteFail == 0" show variant="success">
        <strong>Quest Vote Results:</strong>
        <br>
        <strong>Succeed:</strong>
        {{ voteSucceed }}
        <br>
        <strong>Fail:</strong>
        {{ voteFail }}
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
      showQuestVoteResults: false,
      votes: {},
      voteSucceed: 0,
      voteFail: 0
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
    goOnQuest(data) {
      this.canVoteOnQuest = true;
      this.onGoodTeam = data;
    },
    revealVotes(data) {
      this.canVoteOnQuest = false;
      this.showQuestVoteResults = true;
      this.votes = data;
      this.voteSucceed = data.succeed;
      this.voteFail = data.fail;
    },
    hideVotes() {
      this.showQuestVoteResults = false;
      this.canVoteOnQuest = false;
    }
  }
};
</script>