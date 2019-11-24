import Vue from "vue";
import store from './vuex/store';
import app from './app.vue';

let v = new Vue({
  el: '#eme',
  store,
  components: {app}
});
