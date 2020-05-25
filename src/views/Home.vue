<template>
  <div class="container offset-top">
    <h1 class="title">Play Avalon Online</h1>
    <h2 class="subtitle">A Game of deception and deduction</h2>
    <div v-if="!(createToggled || joinToggled || spectateToggled)">
      <b-button :pressed.sync="createToggled" class="avalon-btn-primary big">Create Room</b-button>
      <b-button :pressed.sync="joinToggled" class="avalon-btn-primary big">Join Room</b-button>
      <b-button :pressed.sync="spectateToggled" class="avalon-btn-primary big">Spectate Room</b-button>
    </div>
    <div v-if="createToggled">
      <CreateForm />
      <b-button
        :pressed.sync="createToggled"
        @click="$event.target.blur()"
        class="avalon-btn-primary big"
      >Back</b-button>
    </div>
    <div v-if="joinToggled">
      <JoinForm action="joinRoom" text="Join Room" />
      <b-button
        :pressed.sync="joinToggled"
        @click="$event.target.blur()"
        class="avalon-btn-primary big"
      >Back</b-button>
    </div>
    <div v-if="spectateToggled">
      <JoinForm action="spectateRoom" text="Spectate Room" />
      <b-button
        :pressed.sync="spectateToggled"
        @click="$event.target.blur()"
        class="avalon-btn-primary big"
      >Back</b-button>
    </div>
  </div>
</template>

<script>
import JoinForm from "@/components/home/JoinForm.vue";
import CreateForm from "@/components/home/CreateForm.vue";

export default {
  components: {
    JoinForm,
    CreateForm
  },
  data() {
    return {
      joinToggled: false,
      createToggled: false,
      spectateToggled: false
    };
  }
};
</script>

<style>
.offset-top {
  margin-top: 10%;
}
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
  text-shadow: 1px 1px 2px #8a7d6e;
}

@media screen and (max-width: 425px) {
  .offset-top {
    margin-top: 25%;
  }
}
</style>