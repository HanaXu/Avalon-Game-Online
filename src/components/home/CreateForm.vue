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
        @keydown.enter.native.prevent="createRoom"
      ></b-input>
      <b-button @click="createRoom" id="create-room-btn" class="avalon-btn-lg">Create Room</b-button>
    </b-form>
    <div v-if="loading" class="text-center">
      <b-spinner variant="dark" label="Text Centered"></b-spinner>
    </div>
    <b-alert variant="danger" v-if="error" show>{{ errorMsg }}</b-alert>
    <Auth v-if="createRoomClicked && authRequired" :name="name"></Auth>
  </div>
</template>

<script>
import Auth from "@/components/home/Auth.vue";
import axios from "axios";

export default {
  name: "CreateForm",
  components: {
    Auth
  },
  data() {
    return {
      name: null,
      roomCode: null,
      loading: false,
      error: false,
      errorMsg: null,
      createRoomClicked: false,
      authRequired: null
    };
  },
  beforeMount: function() {
    this.$socket.emit("checkForAuth");
  },
  methods: {
    createRoom() {
      this.error = false;
      this.createRoomClicked = true;
      if (!this.authRequired) {
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
    }
  },
  sockets: {
    errorMsg(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.loading = false;
    },
    checkForAuth(bool) {
      this.authRequired = bool;
    },
    passedValidation() {
      this.loading = false;
      this.$router.push({
        name: "game",
        params: { yourName: this.name, roomCode: this.roomCode }
      });
    }
  }
};
</script>