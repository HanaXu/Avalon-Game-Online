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
    }
  }
};
</script>