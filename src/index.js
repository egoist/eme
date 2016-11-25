/* eslint-disable no-new */
import Vue from 'vue'
import store from './vuex/store'
import app from './app'

new Vue({
  el: '#app',
  store,
  render: h => h(app)
})
