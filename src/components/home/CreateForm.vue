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
    <Auth v-if="createRoomClicked" :name="name"></Auth>
  </div>
</template>

<script>
import Auth from "@/components/Auth.vue";

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
      createRoomClicked: false
    };
  },
  methods: {
    createRoom() {
      this.error = false;
      // this.loading = true;
      this.createRoomClicked = true;
    }
  },
  sockets: {
    errorMsg(msg) {
      this.error = true;
      this.errorMsg = msg;
      this.loading = false;
    }
  }
};
</script>