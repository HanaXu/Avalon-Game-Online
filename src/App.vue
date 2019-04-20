<template>
  <div id="app">
    <!-- Navbar -->
    <b-navbar toggleable="lg" class="navbar-default container" sticky>
      <b-navbar-brand >{{ navbarBrandMsg }}</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="/">Home</b-nav-item>
          <b-nav-item v-b-modal.modal-rules busy="true">Rules</b-nav-item>
          <b-nav-item v-b-modal.modal-roles  busy="true">Roles</b-nav-item>
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
  sockets: {
    roomCode(roomCode) {
      this.navbarBrandMsg = "Room " + roomCode;
    }
  }
};
</script>


<style lang="scss">
@import '/styles/styles.css';
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100% !important;
}
.navbar-default {
  background: #eae7e3;
  border-color: #e7e7e7;
  box-shadow: 0 2px 5px #c2ab8e;
  width: 100%;
}
.navbar-default .navbar-brand {
  color: #777;
}
.navbar-default .navbar-brand:hover,
.navbar-default .navbar-nav .nav-link:hover {
  color: #494949;
}
body {
 /* padding: 20px 0px;*/
  background: #d6cdc2 !important;
}
*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.heading {
  color: #685035;
}
.modals {
  text-align: left;
}
</style>