<template>
  <div class="jumbo">
    <b-form inline>
      <label class="sr-only" for="inline-form-input-name">Name</label>
      <b-input
        id="inline-form-input-name"
        class="mb-2 mr-sm-2 mb-sm-0"
        placeholder="user2"
        v-model="name"
      ></b-input>

      <label class="sr-only" for="inline-form-input-roomCode">roomCode</label>
      <b-input-group class="mb-2 mr-sm-2 mb-sm-0">
        <b-input id="inline-form-input-roomCode" placeholder="roomCode" v-model="roomCode"></b-input>
      </b-input-group>

      <router-link @click.native="joinRoom" :to="{ name: 'game', params: { yourName: this.name } }" 
      tag="button" class="avalon-btn-lg">Join Room</router-link>
    </b-form>
  </div>
</template>

<script>
export default {
  name: "JoinForm",
  data() {
    return {
      name: "user2",
      roomCode: null
    };
  },
  methods: {
    joinRoom() {
      console.log('join room')
      this.$socket.emit("joinRoom", {
        roomCode: this.roomCode,
        name: this.name
      });
    }
  }
};
</script>

<style scoped>
.jumbo {
  margin-top: 30%;
}
</style>
