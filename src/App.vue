<template>
  <div id="app">
    <Navbar />
    <div class="row justify-content-center">
      <b-alert
        class="col-md-8 position-absolute"
        :show="serverStatus === 'Disconnected'"
        variant="danger"
        dismissible
      >
        <span>You have disconnected from the server.</span>
      </b-alert>
    </div>
    <router-view />
  </div>
</template>

<script>
import Navbar from "@/components/navbar/Navbar.vue";
import { mapState } from "vuex";

export default {
  components: {
    Navbar
  },
  computed: mapState(["serverStatus"])
};
</script>

<style lang="scss">
@import "./assets/common.scss";
</style>