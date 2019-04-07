<template>
  <div class="game">
    <div class="container jumbo">
      <div v-if="loading">Loading...</div>
      <div v-if="!loading">{{ message }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Game",
  data() {
    return {
      loading: true,
      message: null
    };
  },
  sockets: {
    connect: function() {
      console.log("socket connected");
    },
    received: function(data) {
      this.loading = false;
      this.message = data;
      console.log(data);
    }
  }
};
</script>