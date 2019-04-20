<template>
<div style="padding: 4px 0">
  <b-row class="section">
    <b-col class="sectionTitle" cols="3" md="2">Game Status</b-col>
   <b-col >{{ questMsg }}</b-col>
  </b-row>
</div>
</template>
<script>
export default {
  name: "GameStatus",
  props: [
    "questMsg"
  ]
}
</script>
<style>
@import '../styles/styles.css';

</style>