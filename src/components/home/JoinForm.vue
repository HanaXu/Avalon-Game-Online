<template>
  <div>
    <b-form inline>
      <label class="sr-only" for="inline-form-input-roomCode">roomCode</label>
      <b-input-group class="mb-2 mr-sm-2 mb-sm-0">
        <b-input
          autofocus
          id="inline-form-input-roomCode"
          placeholder="room code"
          v-model="roomCode"
          @keydown.enter.native.prevent="joinRoom"
        ></b-input>
      </b-input-group>

      <label class="sr-only" for="inline-form-input-name">Name</label>
      <b-input
        id="inline-form-input-name"
        class="mb-2 mr-sm-2 mb-sm-0"
        placeholder="name"
        v-model="name"
        @keydown.enter.native.prevent="joinRoom"
      ></b-input>

      <b-button @click="joinRoom" id="join-room-btn" class="avalon-btn-lg">Join Room</b-button>
    </b-form>
    <div v-if="loading" class="text-center">
      <b-spinner variant="dark" label="Text Centered"></b-spinner>
    </div>
    <b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>
  </div>
</template>

<script>
import Chat from "@/components/lobby/Chat.vue";

export default {
  name: "JoinForm",
  data() {
    return {
      name: null,
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
    updateErrorMsg(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.loading = false;
    },
    passedValidation() {
      this.$router.push({
        name: "game",
        params: { yourName: this.name, roomCode: this.roomCode }
      });
    }
  }
};
</script>
