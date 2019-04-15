<template>
<div>

  <div class="row justify-content-md-center">
    <b-button class="avalon-btn-lg" @click="questVote('succeed')">Succeed</b-button>
    <b-button class="avalon-btn-lg" @click="questVote('fail')" :disabled="onGoodTeam">Fail</b-button>
  </div>

</div>
</template>
<script>
export default {
  name: "QuestVotes",
  props: [
    "onGoodTeam"
  ],
  methods: {
    questVote(decision) {
      this.$socket.emit("questVote", {
        name: this.yourName,
        decision: decision
      });
    }
  }
}
</script>