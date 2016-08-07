import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import app from './modules/app'
import editor from './modules/editor'

const store = new Vuex.Store({
  modules: {
    app,
    editor
  }
})

export default store
