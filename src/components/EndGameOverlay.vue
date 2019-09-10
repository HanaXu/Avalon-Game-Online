<template>
  <div v-if="gameOver" class="container" id="overlay">
    <h1 class="gameOverMessage">Game Over</h1>
    <span class="text-light">{{ endGameMsg }}</span>
  </div>
</template>

<script>
export default {
  name: "EndGameOverlay",
  data() {
    return {
      gameOver: false,
      endGameMsg: null
    };
  },
  sockets: {
    gameOver(msg) {
      this.gameOver = true;
      this.endGameMsg = msg;
    }
  }
};
</script>

<style>
/****MOBILE SCREENS****/
@media screen and (min-width: 1px) {
  #overlay {
    border-radius: 5px;
    padding: 30% 0;
    margin: 0;
    height: 100%;
    background-color: rgba(20, 7, 25, 0.7);
    position: absolute;
    z-index: 999;
    overflow: hidden;
  }
}


/****NORMAL SCREENS****/
@media screen and (min-width: 768px) {
  #overlay {
    margin: 10px 10px 10px 0;
  }
}

#overlay .gameOverMessage {
  font-weight: bold;
  color: white !important;
}
</style>