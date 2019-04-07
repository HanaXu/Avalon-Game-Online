<template>
  <div class="jumbo">
    <b-form inline>
      <label class="sr-only" for="inline-form-input-name">Name</label>
      <b-input
        id="inline-form-input-name"
        class="mb-2 mr-sm-2 mb-sm-0"
        placeholder="user1"
        v-model="name"
      ></b-input>
      <b-button class="avalon-btn-lg" @click="getRandomNum">Create Room</b-button>
    </b-form>
  </div>
</template>

<script>
import axios from "axios";
import io from "socket.io-client";

export default {
  name: "CreateForm",
  data() {
    return {
      name: "user1"
    };
  },
  methods: {
    getRandomNum() {
      axios
        .get(
          "https://www.random.org/integers/?num=1&min=1&max=999999&col=1&base=10&format=plain&rnd=new"
        )
        .then(res => {
          console.log(res.data);
          console.log(this.name);
          const socket = io("localhost:3000");
          socket.emit("roomCode", { roomCode: res.data, name: this.name });
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
