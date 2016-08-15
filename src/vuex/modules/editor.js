import path from 'path'
import {remote} from 'electron'
import md from 'utils/markdown'

const win = remote.getCurrentWindow()
win.$state.unsaved = 0

const renderHTML = tab => {
  return md.render(tab.content).replace(/src=\"([^\"]+)\"/g, (m, p1) => {
    if (p1[0] === '.') {
      p1 = path.join(path.dirname(tab.filePath), p1)
      return `src="${p1}"`
    }
    return m
  })
}

const getWordCount = text => {
  const m = text.match(/[\u00ff-\uffff]|\S+/g)
  return m ? m.length : 0
}

const state = {
  tabs: [],
  currentTabIndex: 0
}

const mutations = {
  INIT_NEW_TAB(state, payload) {
    const tab = {
      ...payload,
      html: renderHTML(payload),
      wordCount: getWordCount(payload.content)
    }
    state.tabs.push(tab)
    state.currentTabIndex++
  },
  UPDATE_CONTENT(state, {index, content}) {
    const tab = state.tabs[index]
    tab.content = content
    tab.html = renderHTML(tab)
    tab.wordCount = getWordCount(tab.content)
  },
  UPDATE_FILE_PATH(state, {index, filePath}) {
    const tab = state.tabs[index]
    tab.filePath = filePath
    document.title = `${path.basename(filePath)} - EME`
  },
  UPDATE_CONTENT_WITH_FILEPATH(state, {index, content, filePath}) {
    const tab = state.tabs[index]
    tab.content = content
    tab.html = renderHTML({
      ...tab,
      content,
      filePath
    })
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
