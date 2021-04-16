<template>
  <b-row class="justify-content-center mt-3 mb-2">
    <div class="vote-track-ctn">
      <span>Vote Track</span>
      <div>
        <span
          v-for="index in 5"
          :key="index"
          class="circle"
          :class="{ markBG: index === currentVoteTrack }"
          >{{ index }}</span
        >
      </div>
    </div>
  </b-row>
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

<style scoped lang="scss">
.vote-track-ctn {
  display: flex;
  span {
    font-weight: bold;
    padding: .5rem;
  }
}
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

@media screen and (min-width: 769px) {
  .circle {
    width: 40px;
    height: 40px;
    padding-top: 10px;
    font-size: 15px;
  }
}
</style>
