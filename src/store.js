import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    serverStatus: '',
    playerName: '',
    roomCode: null,
    gameStarted: false,
    players: [],
    spectators: [],
    specialRoles: []
  },
  mutations: {
    SOCKET_goToLobby(state, { playerName, roomCode }) {
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
    SOCKET_startGame(state, { startGame, playerName, roomCode }) {
      state.gameStarted = startGame;
      if (roomCode) {
        state.roomCode = roomCode;
      }
      if (playerName) {
        state.playerName = playerName;
      }

      if (state.gameStarted) {
        sessionStorage.clear();
        router.push({
          name: "game",
          params: {
            playerName: state.playerName,
            roomCode: state.roomCode
          }
        });
      }
    },
    SOCKET_updatePlayerCards(state, players) {
      state.players = players;
    },
    SOCKET_updateSpectatorsList(state, spectators) {
      state.spectators = spectators;
    },
    SOCKET_connect(state) {
      state.serverStatus = 'Connected';
    },
    SOCKET_disconnect(state) {
      state.serverStatus = 'Disconnected';
      state.gameStarted = false;
      state.roomCode = null;
      state.playerName = '';
      state.players = [];
      state.spectators = [];
      state.specialRoles = [];

      router.push({ path: "/" });
    },
    SOCKET_windowReload(state) {
      state.roomCode = null;
      router.push({ path: "/" });
      window.location.reload();
    },
    SOCKET_updateSpecialRoles(state, specialRoles) {
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
