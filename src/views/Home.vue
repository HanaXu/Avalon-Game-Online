<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <section class="container">
      <div v-if="!(joinToggled || createToggled)" class="jumbo">
        <h1 class="title">Avalonline</h1>
        <h2 class="subtitle">A Game of Dedication and Bluffing</h2>
        <b-button :pressed.sync="createToggled" class="avalon-btn-lg">Create Room</b-button>
        <b-button :pressed.sync="joinToggled" class="avalon-btn-lg">Join Room</b-button>
      </div>
      <div v-if="createToggled">
        <CreateForm class="jumbo"></CreateForm>
        <b-button :pressed.sync="createToggled" class="avalon-btn-lg float-left">Back</b-button>
      </div>
      <div v-if="joinToggled">
        <JoinForm class="jumbo"></JoinForm>
        <b-button :pressed.sync="joinToggled" class="avalon-btn-lg float-left">Back</b-button>
      </div>
    </section>
  </div>
</template>

<script>
// @ is an alias to /src
import JoinForm from '@/components/JoinForm.vue';
import CreateForm from '@/components/CreateForm.vue';

export default {
  name: 'home',
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
.jumbo {
  margin-top: 15%;
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
