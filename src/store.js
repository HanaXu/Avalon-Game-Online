import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    roomCode: '',
    playerName: '',
    players: [],
    serverStatus: 'Offline'
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
      state.serverStatus = 'Online';
    },
    SOCKET_disconnect(state) {
      state.serverStatus = 'Offline';
    }
  },
  actions: {
  }
})
