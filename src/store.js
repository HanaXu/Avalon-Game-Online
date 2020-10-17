import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    roomCode: null,
    playerName: '',
    players: [],
    serverStatus: '',
    specialRoles: []
  },
  mutations: {
    SOCKET_goToGame(state, { playerName, roomCode }) {
      state.playerName = playerName;
      state.roomCode = roomCode;
    },
    SOCKET_updatePlayerCards(state, players) {
      state.players = players;
    },
    SOCKET_connect(state) {
      state.serverStatus = 'Connected';
    },
    SOCKET_disconnect(state) {
      state.serverStatus = 'Disconnected';
      router.push({
        name: "home"
      });
    },
    SOCKET_windowReload() {
      window.location.reload();
    },
    SOCKET_updateSpecialRoles(state, specialRoles) {
      state.specialRoles = specialRoles;
    },
    updateSpecialRoles(state, specialRoles) {
      state.specialRoles = specialRoles;
    }
  },
  actions: {
  }
})
