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
      <router-link
        @click.native="getRandomNum"
        to="/game"
        :name="name"
        tag="button"
        class="avalon-btn-lg"
      >Create Room</router-link>
    </b-form>
  </div>
</template>

<script>
import axios from "axios";

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
          this.$socket.emit("createRoom", { roomCode: res.data, name: this.name });
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
