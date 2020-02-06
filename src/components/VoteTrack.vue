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
    background: #7D67AA !important;
    color: white;
  }

  .circle {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: white;
    padding-top: 8px;
    margin-right: 2px;
    font-size: 14px;
    font-weight: bold;
    display: inline-block;
  }

  .section.voteTrack {
    width: 290px;
  }
  .section.voteTrack .sectionTitle {
    font-size: 14px;
    vertical-align: middle;
  }
  .section.voteTrack.col {
    padding: 0 !important;
  }
}

/****NORMAL SCREENS****/
@media screen and (min-width: 769px) {
  .circle {
    width: 50px;
    height: 50px;
    padding-top: 10px;
    margin-right: 0.5rem;
    font-size: 20px;
  }

  .section.voteTrack {
    width: 500px;
  }
}
</style>
