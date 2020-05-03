<template>
  <b-row class="status-section">
    <b-col class="section-title" md="2">Game Status</b-col>
    <b-col>{{ questMsg }}</b-col>
  </b-row>
</template>

<script>
export default {
  name: "GameStatus",
  props: ["questMsg"]
};
</script>

<style>
@import "../../styles/styles.css";
</style>