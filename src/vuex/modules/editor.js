import path from 'path'
import {remote} from 'electron'
import md from 'utils/markdown'

const win = remote.getCurrentWindow()
win.$state.unsaved = 0

const state = {
  tabs: [],
  currentTabIndex: 0
}

const mutations = {
  INIT_NEW_TAB(state, payload) {
    state.tabs.push(payload)
    state.currentTabIndex++
  },
  UPDATE_CONTENT(state, {index, content}) {
    const tab = state.tabs[index]
    tab.content = content
    tab.html = md.render(content)
    const matchWords = tab.content.match(/[\u00ff-\uffff]|\S+/g)
    tab.wordCount = matchWords ? matchWords.length : 0
  },
  UPDATE_FILE_PATH(state, {index, filePath}) {
    const tab = state.tabs[index]
    tab.filePath = filePath
    document.title = `${path.basename(filePath)} - EME`
  },
  UPDATE_SAVE_STATUS(state, {index, saved}) {
    const tab = state.tabs[index]
    const fileName = tab.filePath ?
      path.basename(tab.filePath) :
      'untitled'

    if (saved) {
      if (saved !== tab.saved) win.$state.unsaved--
      document.title = `${fileName} - EME`
    } else {
      if (saved !== tab.saved) win.$state.unsaved++
      document.title = `${fileName} * - EME`
    }

    tab.saved = saved
  },
  SET_EDITOR(state, {index, editor}) {
    state.currentTabIndex = index
    state.tabs[index].editor = editor
  },
  SET_CURRENT_TAB(state, index) {
    state.currentTabIndex = index
  },
  CLOSE_TAB(state, indexToClose) {
    if (state.currentTabIndex !== 0 && indexToClose <= state.currentTabIndex) {
      state.currentTabIndex--
    }
    setTimeout(() => {
      const tab = state.tabs[state.currentTabIndex]
      if (tab && tab.editor) {
        tab.editor.refresh()
        tab.editor.focus()
      }
    }, 0)
    state.tabs = state.tabs.filter((tab, index) => {
      return index !== indexToClose
    })
  },
  SET_WRITING_MODE(state, {index, mode}) {
    const tab = state.tabs[index]
    tab.writingMode = mode
    setTimeout(() => {
      tab.editor.refresh()
      if (mode !== 'preview') tab.editor.focus()
    }, 0)
  },
  UPDATE_PDF(state, {index, pdf}) {
    const tab = state.tabs[index]
    tab.pdf = pdf
  }
}

export default {
  state,
  mutations
}
