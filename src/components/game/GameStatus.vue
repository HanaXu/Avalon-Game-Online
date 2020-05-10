<template>
  <b-row v-if="(showQuestMsg && questMsg.length > 0)" class="status-section">
    <b-col class="section-title" md="2">Game Status</b-col>
    <b-col>{{ questMsg }}</b-col>
  </b-row>
</template>

<script>
export default {
  data() {
    return {
      questMsg: null,
      showQuestMsg: false
    };
  },
  sockets: {
    updateQuestMsg(msg) {
      this.questMsg = msg;
      this.showQuestMsg = true;
    }
  }
};
</script>