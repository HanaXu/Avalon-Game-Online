<template>
  <div class="row">
    <b-row class="justify-content-center status-section">
      <b-col class="section-title">Vote Track</b-col>
      <div class="p-1">
        <span
          v-for="index in 5"
          :key="index"
          class="circle"
          :class="{ markBG: index === currentVoteTrack }"
          >{{ index }}</span
        >
      </div>
    </b-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentVoteTrack: null
    };
  },
  sockets: {
    updateVoteTrack(voteTrack) {
      this.currentVoteTrack = voteTrack;
    }
  }
};
</script>

<style scoped>
/****MOBILE SCREENS****/
@media screen and (min-width: 1px) {
  .markBG {
    background: #7d67aa !important;
    color: white;
  }
  .circle {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #f8f9fa;
    box-shadow: 1px 2px 5px #c2ab8e;
    padding-top: 8px;
    margin-right: 0.5rem;
    font-size: 14px;
    font-weight: bold;
    display: inline-block;
  }
  .circle:first-child {
    margin-left: 0.4rem;
  }
}

/****NORMAL SCREENS****/
@media screen and (min-width: 769px) {
  .circle {
    width: 40px;
    height: 40px;
    padding-top: 10px;
    font-size: 15px;
  }
}
</style>
