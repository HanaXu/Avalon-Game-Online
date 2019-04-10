<template>
  <div>
    <b-form inline>
      <label class="sr-only" for="inline-form-input-roomCode">roomCode</label>
      <b-input-group class="mb-2 mr-sm-2 mb-sm-0">
        <b-input
          autofocus
          id="inline-form-input-roomCode"
          placeholder="roomCode"
          v-model="roomCode"
        ></b-input>
      </b-input-group>

      <label class="sr-only" for="inline-form-input-name">Name</label>
      <b-input
        id="inline-form-input-name"
        class="mb-2 mr-sm-2 mb-sm-0"
        placeholder="name"
        v-model="name"
      ></b-input>

      <b-button @click="joinRoom" class="avalon-btn-lg">Join Room</b-button>
    </b-form>
    <div v-if="loading" class="text-center">
      <b-spinner variant="dark" label="Text Centered"></b-spinner>
    </div>
    <div style="margin-top: 1rem" v-if="error">{{ errorMsg }}</div>
  </div>
</template>

<script>
export default {
  name: "JoinForm",
  data() {
    return {
      name: "2",
      roomCode: null,
      error: false,
      loading: false,
      errorMsg: null
    };
  },
  methods: {
    joinRoom() {
      this.error = false;
      this.loading = true;
      this.$socket.emit("joinRoom", {
        roomCode: this.roomCode,
        name: this.name
      });
    }
  },
  sockets: {
    errorMsg: function(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.loading = false;
    },
    passedValidation: function() {
      this.$router.push({
        name: "game",
        params: { yourName: this.name, roomCode: this.roomCode }
      });
    }
  }
};
</script>
