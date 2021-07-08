import Vue from 'vue'
import App from './App.vue'
import Pusher from 'pusher-js';
import axios from 'axios';

Vue.config.productionTip = false

Vue.prototype.$http = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
})

Vue.prototype.$pusher = new Pusher(process.env.VUE_APP_PUSHER_APP_KEY, {
  cluster: 'eu'
})

new Vue({
  render: h => h(App),
}).$mount('#app')