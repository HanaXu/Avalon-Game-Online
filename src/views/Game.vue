<template>
  <div class="game"></div>
</template>

<script>
import io from "socket.io-client";

export default {
  name: "Game",
  data() {
    return {
      loading: false,
      roomCode: null,
      name: null
    };
  },
  beforeMount: function() {
    console.log("before mount");
    const socket = io("localhost:3000");
    socket.on("received", function(message) {
      console.log("received " + message);
    });
  }
};
</script>
