<template>
  <div class="row justify-content-center">
    <b-row class="d-flex flex-wrap section">
      <b-col class="sectionTitle" cols="3" md="2">Vote Track</b-col>
      <b-col class="circles">
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
  data() {
    return {
      currentVoteTrack: null
    };
  },
  sockets: {
    updateVoteTrack(data) {
      this.currentVoteTrack = data["voteTrack"];
    }
  }
};
</script>

<style scoped>
</style>
