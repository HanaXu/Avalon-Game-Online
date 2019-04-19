<template xmlns="">
  <div id="app">
    <!-- Navbar -->
    <b-navbar toggleable="lg" class="navbar-default" sticky="true">
      <b-navbar-brand to="/">Avalonline</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item @click="openModal">Game Rules</b-nav-item>
          <b-nav-item @click="openModalRoles">Roles</b-nav-item>
          <b-nav-item @click="openModalGameHistory">Game History</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <!-- Game Rules Modal -->
    <modal v-if="showModal">
      <h3 slot="header" class="modal-title">Game Rules</h3>
      <div slot="footer">
        <button type="button" class="btn btn-outline-info" @click="closeModal()">Close</button>
      </div>
    </modal>
    <!-- End of: Game Rules Modal -->

    <!-- Roles Modal -->
    <modalRoles v-if="showModalRoles">
      <h3 slot="header" class="modal-title">Character Roles</h3>
      <div slot="footer">
        <button type="button" class="btn btn-outline-info" @click="closeModalRoles()">Close</button>
      </div>
    </modalRoles>
    <!-- End of: Roles Modal -->

    <!-- Game History Modal -->
    <modalGameHistory v-if="showModalGameHistory">
      <h3 slot="header" class="modal-title">Game History</h3>
      <div slot="footer">
        <button type="button" class="btn btn-outline-info" @click="closeModalGameHistory()">Close</button>
      </div>
    </modalGameHistory>
    <!-- End of: Game History Modal -->

    <router-view/>
  </div>
</template>


<script>
import modal from "./views/GameRulesModal.vue";
import modalRoles from "./views/RolesModal.vue";
import modalGameHistory from "./views/GameHistory.vue";
import home from "./views/Home.vue";

export default {
  components: {
    //Game Rules Modal Component
    modal,
    modalRoles,
    modalGameHistory,
    home
  },
  data() {
    return {
      showModal: false,
      showModalRoles: false,
      showModalGameHistory: false
    };
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    openModalRoles() {
      this.showModalRoles = true;
    },
    closeModalRoles() {
      this.showModalRoles = false;
    },
    openModalGameHistory() {
      this.showModalGameHistory = true;
    },
    closeModalGameHistory() {
      this.showModalGameHistory = false;
    }
  }
};
</script>


<style lang="scss">
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
  box-shadow: 0 2px 5px #c2ab8e;
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
.modal-title {
  color: #685035;
}
</style>