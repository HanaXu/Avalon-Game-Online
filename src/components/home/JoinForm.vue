<template>
  <div>
    <b-form inline>
      <label class="sr-only" for="inline-form-input-room-code">Room code</label>
      <b-input-group class="mb-2 mr-sm-2 mb-sm-0">
        <b-input
          autofocus
          id="inline-form-input-room-code"
          placeholder="Room code"
          v-model="roomCode"
          @keydown.enter.native.prevent="handleClick(action)"
        ></b-input>
      </b-input-group>
      <label class="sr-only" for="inline-form-input-player-name">Player name</label>
      <b-input
        id="inline-form-input-player-name"
        class="mb-2 mr-sm-2 mb-sm-0"
        placeholder="Player name"
        v-model="playerName"
        @keydown.enter.native.prevent="handleClick(action)"
      ></b-input>
      <b-button @click="handleClick(action)" class="avalon-btn-primary big">{{text}}</b-button>
    </b-form>
    <div v-if="loading" class="text-center">
      <b-spinner variant="dark" label="Text Centered"></b-spinner>
    </div>
    <b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      playerName: null,
      roomCode: null,
      error: false,
      loading: false,
      errorMsg: null
    };
  },
  props: ["action", "text"],
  computed: mapState(["serverStatus"]),
  methods: {
    handleClick(action) {
      if (this.serverStatus === 'Disconnected') {
        this.error = true;
        this.errorMsg = 'Error: Unable to connect to server.';
        return;
      }
      this.error = false;
      this.loading = true;
      this.$socket.emit(action, {
        roomCode: this.roomCode,
        playerName: this.playerName
      });
    }
  },
  sockets: {
    updateErrorMsg(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.loading = false;
    }
  }
};
</script>
