<template>
  <div id="app">
    <!-- Navbar -->
    <b-navbar toggleable="lg" class="navbar-default container">
      <b-navbar-brand>
        <img
          src="../public/img/icons/favicon-32x32.png"
          alt="Avalonline icon"
          width="32"
          height="32"
        />
        Avalonline
        <span v-if="roomCode">Room {{ roomCode }}</span>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/" @click="reload">Home</b-nav-item>
          <b-nav-item v-b-modal.modal-rules busy="true">Rules</b-nav-item>
          <b-nav-item v-b-modal.modal-roles busy="true">Roles</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <div class="modals">
      <RulesModal />
      <RolesModal />
    </div>
    <router-view />
  </div>
</template>

<script>
import Home from "./views/Home.vue";
import RulesModal from "@/components/navbar/RulesModal.vue";
import RolesModal from "@/components/navbar/RolesModal.vue";
import { mapState } from "vuex";

export default {
  components: {
    Home,
    RulesModal,
    RolesModal
  },
  computed: mapState(["roomCode"]),
  methods: {
    reload() {
      window.location.reload();
    }
  }
};
</script>

<style lang="scss">
@import "./assets/common.scss";
.modals {
  text-align: left;
}
.heading {
  color: #685035;
}
.modal-header {
  background: #eae7e3;
}
.modal-body {
  background: #eae7e3;
  .form-control,
  .form-control:focus,
  .form-control:active {
    background: #eae7e3; /* bootstrap 4 bg-light*/
  }
}
.modal-footer {
  background: #eae7e3;
}
</style>