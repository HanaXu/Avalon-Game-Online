import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// import "./registerServiceWorker";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import BootstrapVue from "bootstrap-vue";
import VueSocketIO from 'vue-socket.io-extended';
import io from 'socket.io-client';
import VueChatScroll from "vue-chat-scroll";

const ioInstance = io(process.env.VUE_APP_SOCKET_CONNECT_URL, {
  reconnection: true,
  reconnectionDelay: 500,
  maxReconnectionAttempts: Infinity,
});

Vue.use(BootstrapVue);
Vue.use(VueChatScroll);
Vue.use(VueSocketIO, ioInstance, {
  store, // vuex store instance
  actionPrefix: 'SOCKET_', // (1) keep prefix in uppercase
  eventToActionTransformer: (actionName) => actionName // (2) cancel camelcasing
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
