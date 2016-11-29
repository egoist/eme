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
    if (theme === 'dark') {
      state.settings.theme = 'white'
      state.settings.preview.highlight = 'github'
      state.settings.editor.theme = 'base16-light'
    } else {
      state.settings.theme = 'dark'
      state.settings.preview.highlight = 'tomorrow-night-bright'
      state.settings.editor.theme = 'tomorrow-night-bright'
    }
  }
}

export default {
  state,
  mutations
}
