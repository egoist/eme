/* eslint-disable no-new */
import Vue from 'vue'
import app from './app'
import DnD from 'directives/dnd'

Vue.use(DnD)

new Vue({
  el: '#app',
  ...app
})
