<template>

  <b-row class="section">
    <b-col class="sectionTitle" cols="3" md="2">Vote Track</b-col>
    <b-col>
      <div
        class="circle"
        :class="{markBG: index === currentVoteTrack}"
        v-for="index in 5"
        :key="index"
      >{{ index }}</div>
    </b-col>
  </b-row>

<!--
  <div class="row justify-content-md-center">
    <span class="text-dark mx-2" style="margin-top: .7rem">Vote Track:</span>
    <div
      class="circle"
      :class="{markBG: index === currentVoteTrack}"
      v-for="index in 5"
      :key="index"
    >{{ index }}</div>
  </div> -->
</template>

<script>
export default {
  name: "VoteTrack",
  props: ["currentVoteTrack"]
};
</script>

<style scoped>

</style>
