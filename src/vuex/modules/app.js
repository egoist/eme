import {remote} from 'electron'

const currentWindow = remote.getCurrentWindow()

const state = {
  showPreferencePane: false,
  settings: JSON.parse(JSON.stringify(currentWindow.$config.get('settings')))
}

const mutations = {
  TOGGLE_PREFERENCE_PANE(state) {
    state.showPreferencePane = !state.showPreferencePane
  },
  UPDATE_SETTINGS(state, settings) {
    state.settings = settings
  },
  TOGGLE_NIGHT_MODE(state) {
    const {theme} = state.settings
    if (theme !== 'dark') {
      state.settings.theme = 'dark'
      state.settings.colorSchema = 'tomorrow-night-bright'
    } else {
      state.settings.theme = 'white'
      state.settings.colorSchema = 'base16-light'
    }
  }
}

export default {
  state,
  mutations
}
