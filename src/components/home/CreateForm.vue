<template>
  <div>
    <b-form inline>
      <label class="sr-only" for="inline-form-input-player-name">Player name</label>
      <b-input
        autofocus
        id="inline-form-input-player-name"
        class="mb-2 mr-sm-2 mb-sm-0"
        placeholder="Player name"
        v-model="playerName"
        @keydown.enter.native.prevent="createRoom"
      ></b-input>
      <b-button @click="createRoom" id="create-room-btn" class="avalon-btn-primary big">Create Room</b-button>
    </b-form>
    <div v-if="loading" class="text-center">
      <b-spinner variant="dark" label="Text Centered"></b-spinner>
    </div>
    <b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>
    <!-- <Auth v-if="createRoomClicked && authRequired"></Auth> -->
  </div>
</template>

<script>
// import Auth from "@/components/home/Auth.vue";

export default {
  // components: {
  //   Auth
  // },
  data() {
    return {
      playerName: null,
      loading: false,
      error: false,
      errorMsg: null,
      createRoomClicked: false,
      // authRequired: null
    };
  },
  // beforeMount: function() {
  //   this.$socket.emit("checkForAuth");
  // },
  methods: {
    createRoom() {
      this.error = false;
      this.createRoomClicked = true;
      // if (!this.authRequired) {
      // }
      this.loading = true;
      this.$socket.emit("createRoom", this.playerName);
    }
  },
  sockets: {
    updateErrorMsg(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.loading = false;
    },
    // setAuth(requireAuth) {
    //   this.authRequired = requireAuth;
    // },
    goToGame({ playerName, roomCode }) {
      this.loading = false;
      this.$router.push({
        name: "game",
        params: { playerName, roomCode }
      });
    }
  }
};
</script>