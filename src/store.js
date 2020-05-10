import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    roomCode: '',
    playerName: '',
    players: []
  },
  mutations: {
    SOCKET_passedValidation(state, { playerName, roomCode }) {
      state.playerName = playerName;
      state.roomCode = roomCode;
    },
    SOCKET_updatePlayerCards(state, players) {
      state.players = players;
    }
  },
  actions: {
  }
})
