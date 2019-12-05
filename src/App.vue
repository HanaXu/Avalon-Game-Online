<template>
  <div id="app">
    <!-- Navbar -->
    <b-navbar toggleable="lg" class="navbar-default container">
      <b-navbar-brand><img src="../public/img/icons/favicon-32x32.png" width="32" height="32" /> {{ navbarBrandMsg }}</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/" @click="reload">Home</b-nav-item>
          <b-nav-item v-b-modal.modal-rules busy="true">Rules</b-nav-item>
          <b-nav-item v-b-modal.modal-roles busy="true">Roles</b-nav-item>
          <b-nav-item v-b-modal.modal-history busy="true">Game History</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <div class="modals">
      <RulesModal/>
      <RolesModal/>
      <HistoryModal/>
    </div>
    <router-view/>
  </div>
</template>

<script>
import Home from "./views/Home.vue";
import RulesModal from "@/components/navbar/RulesModal.vue";
import RolesModal from "@/components/navbar/RolesModal.vue";
import HistoryModal from "@/components/navbar/HistoryModal.vue";

export default {
  components: {
    Home,
    RulesModal,
    RolesModal,
    HistoryModal
  },
  data() {
    return {
      navbarBrandMsg: "Avalonline"
    };
  },
  methods: {
    reload() {
      window.location.reload();
    }
  },
  sockets: {
    roomCode(roomCode) {
      this.navbarBrandMsg = "Avalonline Room " + roomCode;
    }
  }
};
</script>

<style>
@import "/styles/styles.css";
</style>