<template>
  <div class="container" style="margin-top: 10%">
    <h1 class="title">Avalonline</h1>
    <h2 class="subtitle">A Game of Dedication and Bluffing</h2>
    <div v-if="!(createToggled || joinToggled)">
      <b-button :pressed.sync="createToggled" id="create-room-btn" class="avalon-btn">Create Room</b-button>
      <b-button :pressed.sync="joinToggled" id="join-room-btn" class="avalon-btn">Join Room</b-button>
    </div>
    <div v-if="createToggled">
      <CreateForm />
      <b-button
        :pressed.sync="createToggled"
        @click="$event.target.blur()"
        class="avalon-btn"
      >Back</b-button>
    </div>
    <div v-if="joinToggled">
      <JoinForm />
      <b-button :pressed.sync="joinToggled" @click="$event.target.blur()" class="avalon-btn">Back</b-button>
    </div>
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

<style>
.form-inline {
  display: inline-flex !important;
}
h1.title {
  font-size: 50px;
  color: #503e2c;
  margin-bottom: 1rem;
}
h2.subtitle {
  font-size: 25px;
  color: #503e2c;
  margin-bottom: 0.8rem;
}
h1.title,
h2.subtitle {
    text-shadow: 1px 1px 2px #8A7D6E;
}
</style>