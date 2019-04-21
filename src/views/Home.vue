<template>
  <div>
    <section class="container" style="margin-top: 10%">
      <div v-if="!(joinToggled || createToggled)">
        <h1 class="title">Avalonline</h1>
        <h2 class="subtitle">A Game of Dedication and Bluffing</h2>
        <b-button
          :pressed.sync="createToggled"
          id="create-room-btn"
          class="avalon-btn-lg"
        >Create Room</b-button>
        <b-button :pressed.sync="joinToggled" id="join-room-btn" class="avalon-btn-lg">Join Room</b-button>
      </div>
      <div v-if="createToggled">
        <CreateForm></CreateForm>
        <b-button :pressed.sync="createToggled" class="avalon-btn-lg">Back</b-button>
      </div>
      <div v-if="joinToggled">
        <JoinForm></JoinForm>
        <b-button :pressed.sync="joinToggled" class="avalon-btn-lg">Back</b-button>
      </div>
    </section>
  </div>
</template>

<script>
import JoinForm from "@/components/home/JoinForm.vue";
import CreateForm from "@/components/home/CreateForm.vue";

export default {
  name: "home",
  components: {
    JoinForm,
    CreateForm
  },
  data() {
    return {
      joinToggled: false,
      createToggled: false
    };
  }
};
</script>

<style scoped>
.container {
  margin: 0 auto;
  display: flex;
  justify-content: center;
  text-align: center;
}
.title {
  font-size: 50px;
  color: #503e2c;
  margin-bottom: 1rem;
}
.subtitle {
  font-size: 25px;
  color: #503e2c;
  margin-bottom: 0.8rem;
}
</style>