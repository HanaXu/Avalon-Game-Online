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
      <strong>{{ voted }}</strong>
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
      voted: null,
      successCount: null,
      failCount: null
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