/* eslint-disable no-new */
import Vue from 'vue'
import store from './vuex/store'
import app from './app'
import DnD from 'directives/dnd'
import Transitions from 'utils/transitions'

Vue.use(DnD)
Vue.use(Transitions)

new Vue({
  el: 'body',
  store,
  components: {app}
})
