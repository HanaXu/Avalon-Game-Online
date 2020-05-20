<template>
  <b-row v-if="statusMsg" class="status-section">
    <b-col class="section-title" md="2">Game Status</b-col>
    <b-col v-html="statusMsg" :class="variant"></b-col>
  </b-row>
</template>

<script>
export default {
  data() {
    return {
      statusMsg: null,
      variant: null
    };
  },
  sockets: {
    updateStatusMsg({ msg, variant }) {
      this.statusMsg = msg;
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