import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    playerName: '',
    roomCode: null,
    gameStarted: false,
    players: [],
    spectators: [],
    specialRoles: []
  },
  mutations: {
    SOCKET_GOTOLOBBY(state, { playerName, roomCode }) {
      state.playerName = playerName;
      state.roomCode = roomCode;

      router.push({
        name: "lobby",
        params: {
          playerName: state.playerName,
          roomCode: state.roomCode
        }
      });
    },
    SOCKET_STARTGAME(state, { startGame, playerName, roomCode, reconnect }) {
      state.gameStarted = startGame;
      if (roomCode) {
        state.roomCode = roomCode;
      }
      if (playerName) {
        state.playerName = playerName;
      }
      if (!reconnect) {
        sessionStorage.clear();
      }

      if (state.gameStarted) {
        router.push({
          name: "game",
          params: {
            playerName: state.playerName,
            roomCode: state.roomCode
          }
        });
      }
    },
    SOCKET_UPDATEPLAYERCARDS(state, players) {
      state.players = players;
    },
    SOCKET_UPDATESPECTATORSLIST(state, spectators) {
      state.spectators = spectators;
    },
    SOCKET_DISCONNECT(state) {
      state.gameStarted = false;
      state.roomCode = null;
      state.playerName = '';
      state.players = [];
      state.spectators = [];
      state.specialRoles = [];

      router.push({ path: "/" });
    },
    SOCKET_WINDOWRELOAD(state) {
      state.roomCode = null;
      router.push({ path: "/" });
      window.location.reload();
    },
    SOCKET_UPDATESPECIALROLES(state, specialRoles) {
      if (specialRoles) {
        state.specialRoles = specialRoles;
      }
    },
    updateSpecialRoles(state, specialRoles) {
      state.specialRoles = specialRoles;
    }
  },
  actions: {
  }
})
