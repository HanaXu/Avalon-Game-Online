<template>
  <div id="firebaseui-auth-container" class="my-1"></div>
</template>

<script>
import firebase from "firebase";
import firebaseui from "firebaseui";
import "../../node_modules/firebaseui/dist/firebaseui.css";
import axios from "axios";
import { bus } from "@/main.js";

export default {
  name: "Auth",
  props: ["name"],
  data() {
    return {
      roomCode: null
    };
  },
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
      console.log("passed auth");
      axios
        .get(
          "https://www.random.org/integers/?num=1&min=1&max=999999&col=1&base=10&format=plain&rnd=new"
        )
        .then(res => {
          this.roomCode = res.data;
          this.$socket.emit("createRoom", {
            roomCode: this.roomCode,
            name: this.name
          });
        });
    }
  },
  sockets: {
    passedValidation() {
      this.$router.push({
        name: "game",
        params: { yourName: this.name, roomCode: this.roomCode }
      });
      bus.$emit("joinChat");
    }
  }
};
</script>
