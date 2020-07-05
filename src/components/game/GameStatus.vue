<template>
  <b-row v-if="msg.length > 0" class="status-section">
    <b-col class="section-title" md="2">Game Status</b-col>
    <b-col v-html="msg"></b-col>
  </b-row>
</template>

<script>
export default {
  data() {
    return {
      msg: ''
    };
  },
  sockets: {
    updateGameStatus(msg) {
      this.msg = msg;
    }
  }
};
</script>