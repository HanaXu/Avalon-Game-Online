<template>
  <div class="jumbo">
    <b-form inline>
      <label class="sr-only" for="inline-form-input-name">Name</label>
      <b-input
        autofocus
        id="inline-form-input-name"
        class="mb-2 mr-sm-2 mb-sm-0"
        placeholder="name"
        v-model="name"
      ></b-input>
      <b-button @click="createRoom" class="avalon-btn-lg">Create Room</b-button>
    </b-form>
    <div v-if="loading" class="text-center">
      <b-spinner variant="dark" label="Text Centered"></b-spinner>
    </div>
    <div style="margin: .5rem" v-if="error">{{ errorMsg }}</div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "CreateForm",
  data() {
    return {
      name: "1",
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
          console.log(this.roomCode);
          console.log(this.name);
          this.$socket.emit("createRoom", {
            roomCode: this.roomCode,
            name: this.name
          });
          this.$router.push({
            name: "game",
            params: { yourName: this.name, roomCode: this.roomCode }
          });
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