import Vue from 'vue'
import store from './vuex/store'
import app from './app'
import DnD from 'utils/dnd-light'

Vue.use(DnD)

new Vue({
  el: 'body',
  store,
  components: {app}
})
