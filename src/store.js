import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    roomCode: null,
    playerName: '',
    players: [],
    serverStatus: 'Disconnected'
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
    }
  },
  actions: {
  }
})
