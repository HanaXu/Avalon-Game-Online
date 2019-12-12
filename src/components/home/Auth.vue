<template>
  <div id="firebaseui-auth-container" class="my-1"></div>
</template>

<script>
import firebase from "firebase";
import firebaseui from "firebaseui";
import "../../../node_modules/firebaseui/dist/firebaseui.css";
import { mapState } from 'vuex';

export default {
  name: "Auth",
  computed: mapState(['name']),
  mounted() {
    let self = this;
    let uiConfig = {
      signInOptions: [
        {
          provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID
        }
      ],
      callbacks: {
        signInSuccessWithAuthResult() {
          localStorage.setItem("authenticated", true);
          self.passedAuth();
        }
      }
    };
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start("#firebaseui-auth-container", uiConfig);
  },
  methods: {
    passedAuth() {
      this.$socket.emit("createRoom", this.name);
    }
  },
  sockets: {
    passedValidation({name, roomCode}) {
      this.$router.push({
        name: "game",
        params: { name: name, roomCode: roomCode }
      });
    }
  }
};
</script>
