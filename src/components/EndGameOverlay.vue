<template>
  <div class="container" id="overlay">
    <h1 class="gameOverMessage">Game Over</h1>
    <p class="message">{{ endGameMsg }}</p>
  </div>
</template>

<script>
export default {
  name: "EndGameOverlay",
  props: ["endGameMsg"]
};
</script>

<style>
#overlay {
  min-height: 75vh;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 3px;
  margin: -1em; /* to undo the padding in .game container */
  padding: 2em;
  position: absolute;
  z-index: 999;
  overflow: hidden;
}

#overlay .gameOverMessage {
  font-weight: bold;
  color: white !important;
}

.subtitle {
}
</style>