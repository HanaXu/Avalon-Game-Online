<template>
  <div class="row justify-content-md-center" style="padding: 1rem;">
    <span class="text-dark mx-2" style="margin-top: .7rem">Vote Track:</span>
    <div
      class="circle"
      :class="{markBG: index === currentVoteTrack}"
      v-for="index in 5"
      :key="index"
    >{{ index }}</div>
  </div>
</template>

<script>
export default {
  name: "VoteTrack",
  props: ["currentVoteTrack"]
};
</script>

<style scoped>
.markBG {
  background: #9370db !important;
}
.circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f8f9fa; /* bootstrap 4 bg-light*/
  padding: 12px;
  margin-right: 0.5rem;
}
</style>
