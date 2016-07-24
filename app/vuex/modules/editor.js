import path from 'path'
import md from 'utils/markdown'

const state = {
  tabs: [],
  currentTabIndex: 0
}

const mutations = {
  INIT_NEW_TAB(state, payload) {
    state.tabs.push(payload)
    state.currentTabIndex++
  },
  UPDATE_CONTENT(state, content) {
    const currentTab = state.tabs[state.currentTabIndex]
    currentTab.content = content
    currentTab.html = md.render(content)
    const matchWords = currentTab.content.match(/[\u00ff-\uffff]|\S+/g)
    currentTab.wordCount = matchWords ? matchWords.length : 0
  },
  UPDATE_FILE_PATH(state, filePath) {
    const currentTab = state.tabs[state.currentTabIndex]
    currentTab.filePath = filePath
    document.title = `${path.basename(filePath)} - EME`
  },
  UPDATE_SAVE_STATUS(state, saved) {
    const currentTab = state.tabs[state.currentTabIndex]
    currentTab.saved = saved
    const fileName = currentTab.filePath ?
      path.basename(currentTab.filePath) :
      'untitled'
    if (saved) {
      document.title = `${fileName} - EME`
    } else {
      document.title = `${fileName} * - EME`
    }
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
    state.tabs = state.tabs.filter((tab, index) => {
      return index !== indexToClose
    })
  }
}

export default {
  state,
  mutations
}
