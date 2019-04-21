import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import VueSocketIO from "vue-socket.io";
import firebase from "firebase";

export const bus = new Vue();

Vue.config.productionTip = false;

// Initialize Firebase
var config = {
  apiKey: "AIzaSyC_0DpX0DNsW0WqtBq88BlQc1MntzEL3ZY",
  authDomain: "avalonline-a8a5b.firebaseapp.com",
  databaseURL: "https://avalonline-a8a5b.firebaseio.com",
  projectId: "avalonline-a8a5b",
  storageBucket: "avalonline-a8a5b.appspot.com",
  messagingSenderId: "932679206673"
};

firebase.initializeApp(config);

Vue.use(BootstrapVue);
Vue.use(
  new VueSocketIO({
    debug: true,
    connection: "http://localhost:3000",
    vuex: {
      store,
      actionPrefix: "SOCKET_",
      mutationPrefix: "SOCKET_"
    }
  })
);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
