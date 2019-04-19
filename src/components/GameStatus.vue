<template>
<div>
  <b-row class="section">
    <b-col class="sectionTitle" cols="3" md="2">Game Status</b-col>
   <b-col >{{ questMsg }} <br> {{ errorMsg }} </b-col>
  </b-row>
</div>
</template>
<script>
export default {
  name: "GameStatus",
  props: [
    "questMsg",
    "errorMsg"
  ]


}
</script>
<style>
@import '../styles/styles.css';

</style>