<template>
  <b-row v-if="msg" class="status-section">
    <b-col class="section-title" md="2">Game Status</b-col>
    <b-col v-html="msg" :class="variant"></b-col>
  </b-row>
</template>

<script>
export default {
  data() {
    return {
      msg: null,
      variant: null
    };
  },
  sockets: {
    updateGameStatus({ msg, variant }) {
      this.msg = msg;
      this.variant = variant;
    }
  }
};
</script>

<style lang="scss" scoped>
.col.success {
  color: #3c48bb !important;
}
.col.danger {
  color: #a42323 !important;
}
</style>