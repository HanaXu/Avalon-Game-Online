<template>
  <div>
    <b-form inline>
            <label class="sr-only" for="inline-form-input-name">Name</label>
            <b-input
              autofocus
              id="inline-form-input-name"
              class="mb-2 mr-sm-2 mb-sm-0"
              placeholder="name"
              v-model="name"
            ></b-input>
            <b-button @click="createRoom" id="create-room-btn" class="avalon-btn-lg">Create Room</b-button>
    </b-form>
    <div v-if="loading" class="text-center">
      <b-spinner variant="dark" label="Text Centered"></b-spinner>
    </div>
    <b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "CreateForm",
  data() {
    return {
      name: null,
      roomCode: null,
      loading: false,
      error: false,
      errorMsg: null
    };
  },
  methods: {
    createRoom() {
      this.error = false;
      this.loading = true;
      axios
        .get(
          "https://www.random.org/integers/?num=1&min=1&max=999999&col=1&base=10&format=plain&rnd=new"
        )
        .then(res => {
          this.roomCode = res.data;

          this.$socket.emit("createRoom", {
            roomCode: this.roomCode,
            name: this.name
          });
        });
    }
  },
  sockets: {
    errorMsg(msg) {
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