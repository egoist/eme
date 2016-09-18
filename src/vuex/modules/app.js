import {remote} from 'electron'

const currentWindow = remote.getCurrentWindow()

const state = {
  showPreferencePane: false,
  settings: currentWindow.$config.store.settings
}

const mutations = {
  TOGGLE_PREFERENCE_PANE(state) {
    state.showPreferencePane = !state.showPreferencePane
  },
  UPDATE_SETTINGS(state, settings) {
    state.settings = settings
  }
}

export default {
  state,
  mutations
}
