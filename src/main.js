import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import VueSocketIO from "vue-socket.io";
import VueChatScroll from "vue-chat-scroll";

Vue.use(BootstrapVue);
Vue.use(VueChatScroll);
Vue.use(
  new VueSocketIO({
    debug: process.env.VUE_APP_DEBUG === "true",
    connection: process.env.VUE_APP_SOCKET_CONNECT_URL,
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
