<template>
  <div class="container" id="overlay">
    <h1 class="gameOverMessage">Game Over</h1>
    <span class="text-light">{{ endGameMsg }}</span>
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