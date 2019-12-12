import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    roomCode: '',
    name: ''
  },
  mutations: {
    SOCKET_passedValidation(state, {name, roomCode}) {
      state.name = name;
      state.roomCode = roomCode;
    }
  },
  actions: {
  }
})
