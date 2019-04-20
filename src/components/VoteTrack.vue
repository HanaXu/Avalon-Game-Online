<template>
<div style="padding-bottom: 4px">
  <b-row class="mx-auto section voteTrack">
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

</div>
</template>

<script>
export default {
  name: "VoteTrack",
  props: ["currentVoteTrack"]
};
</script>

<style scoped>

</style>
