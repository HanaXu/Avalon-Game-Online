<template>
  <div id="app">
    <!-- Navbar -->
    <b-navbar toggleable="lg" class="navbar-default container">
      <b-navbar-brand to="/">{{ navbarBrandMsg }}</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item v-b-modal.modal-rules>Rules</b-nav-item>
          <b-nav-item v-b-modal.modal-roles>Roles</b-nav-item>
          <b-nav-item v-b-modal.modal-history>Game History</b-nav-item>
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
  sockets: {
    roomCode(roomCode) {
      this.navbarBrandMsg = "Avalonline Room " + roomCode;
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.navbar-default {
  background: #eae7e3;
  border-color: #e7e7e7;
  border-radius: 3.5px;
}
.navbar-default .navbar-brand {
  color: #777;
}
.navbar-default .navbar-brand:hover,
.navbar-default .navbar-nav .nav-link:hover {
  color: #494949;
}
body {
  padding: 20px 0px;
  background: #d6cdc2 !important;
}
*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}
.avalon-btn-lg {
  color: #ccc351 !important;
  text-transform: uppercase;
  background: #685035 !important;
  padding: 20px !important;
  border: 4px solid #6f5035 !important;
  border-radius: 7px;
  display: inline-block;
  font-size: 20px !important;
  margin: 5px;
}
.avalon-btn-lg:hover,
.avalon-btn-lg:focus,
.avalon-btn-lg:active {
  color: #685035 !important;
  background: #ccc351 !important;
  border-color: #ccc351 !important;
  transition: all 0.4s ease 0s;
}
.heading {
  color: #685035;
}
.modals {
  text-align: left;
}
</style>
