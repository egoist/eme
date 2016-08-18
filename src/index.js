/* eslint-disable no-new */
import Vue from 'vue'
import store from './vuex/store'
import app from './app'
import DnD from 'directives/dnd'

Vue.use(DnD)

new Vue({
  el: 'body',
  store,
  components: {app}
})
