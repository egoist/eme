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
  CHANGE_THEME(state, theme) {
    if (theme == 'light') {
      state.settings.theme = 'light'
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
