import path from 'path'
import {remote} from 'electron'
import md from 'utils/markdown'
import wordCount from 'word-count'
import fm from 'front-matter'

const win = remote.getCurrentWindow()
win.$state.unsaved = 0

const focusEditor = (tabs, index) => {
  const tab = tabs[index]
  if (tab && tab.editor) {
    tab.editor.refresh()
    tab.editor.focus()
  }
}

const renderHTML = tab => {
  const render = tab => md.render(tab.content).replace(/src="([^"]+)"/g, (m, p1) => {
    if (p1[0] === '.') {
      p1 = path.join(path.dirname(tab.filePath), p1)
      return `src="${p1}"`
    }
    return m
  })

  const data = fm(tab.content)

  if (tab.isPresentationMode) {
    return {
      attrs: data.attributes,
      html: data.body.split('---')
        .map(content => render({
          content,
          filePath: tab.filePath
        }))
    }
  }
  return {
    attributes: data.attributes,
    html: render({content: data.body, filePath: tab.filePath})
  }
}

const state = {
  tabs: [],
  draggingTab: false,
  currentTabIndex: 0,
  currentSlideIndex: 0
}

const mutations = {
  INIT_NEW_TAB(state, payload) {
    const tab = {
      ...payload,
      ...renderHTML(payload),
      wordCount: wordCount(payload.content)
    }
    state.tabs.push(tab)
    state.currentTabIndex++
  },
  UPDATE_CONTENT(state, {index, content}) {
    const tab = state.tabs[index]
    tab.content = content
    // render html in non-writing mode
    if (tab.writingMode !== 'writing') {
      const parsed = renderHTML({
        filePath: tab.filePath,
        content,
        isPresentationMode: tab.isPresentationMode
      })
      tab.html = parsed.html
      tab.attributes = parsed.attributes
    }
    tab.wordCount = wordCount(tab.content)
  },
  UPDATE_FILE_PATH(state, {index, filePath}) {
    const tab = state.tabs[index]
    tab.filePath = filePath
    document.title = `${path.basename(filePath)} - EME`
  },
  UPDATE_CONTENT_WITH_FILEPATH(state, {index, content, filePath}) {
    const tab = state.tabs[index]
    const parsed = renderHTML({
      content,
      filePath,
      isPresentationMode: tab.isPresentationMode
    })
    tab.content = content
    tab.html = parsed.html
    tab.attributes = parsed.attributes
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
  UPDATE_RENAME_STATUS(state, {index, rename}) {
    state.tabs[index].rename = rename
  },
  UPDATE_DRAGGING_STATUS(state, dragging) {
    state.draggingTab = dragging
  },
  UPDATE_EDITOR_SPLIT(state, {index, split}) {
    state.tabs[index].split = split
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
      focusEditor(state.tabs, state.currentTabIndex)
    }, 0)
    state.tabs = state.tabs.filter((tab, index) => {
      return index !== indexToClose
    })
  },
  SET_WRITING_MODE(state, {index, mode}) {
    const tab = state.tabs[index]

    // if previous mode is writing mode
    // render html before switching
    if (tab.writingMode === 'writing') {
      const parsed = renderHTML(tab)
      tab.html = parsed.html
      tab.attributes = parsed.attributes
    }
    tab.writingMode = mode

    setTimeout(() => {
      tab.editor.refresh()
      if (mode !== 'preview') tab.editor.focus()
    }, 0)
  },
  UPDATE_PDF(state, {index, pdf}) {
    const tab = state.tabs[index]
    tab.pdf = pdf
  },
  REORDER_TABS(state, {oldIndex, newIndex}) {
    const tabs = state.tabs
    if (newIndex >= tabs.length) {
      let k = newIndex - tabs.length
      while ((k--) + 1) {
        tabs.push(undefined)
      }
    }
    tabs.splice(newIndex, 0, tabs.splice(oldIndex, 1)[0])
    state.currentTabIndex = newIndex
    setTimeout(() => {
      focusEditor(state.tabs, state.currentTabIndex)
    }, 0)
  },
  TOGGLE_FOCUS_MODE(state) {
    const tab = state.tabs[state.currentTabIndex]
    tab.isFocusMode = !tab.isFocusMode
  },
  TOGGLE_VIM_MODE(state) {
    const tab = state.tabs[state.currentTabIndex]
    tab.isVimMode = !tab.isVimMode
  },
  TOGGLE_PRESENTATION_MODE(state) {
    const tab = state.tabs[state.currentTabIndex]
    tab.isPresentationMode = !tab.isPresentationMode
    const parsed = renderHTML(tab)
    tab.html = parsed.html
    tab.attributes = parsed.attributes
    state.currentSlideIndex = 0
  },
  MOVE_SLIDE(state, direction) {
    const tab = state.tabs[state.currentTabIndex]
    if (direction === 'right') {
      if (state.currentSlideIndex === tab.html.length - 1) {
        state.currentSlideIndex = 0
      } else {
        state.currentSlideIndex++
      }
    } else if (direction === 'left') {
      if (state.currentSlideIndex === 0) {
        state.currentSlideIndex = tab.html.length - 1
      } else {
        state.currentSlideIndex--
      }
    }
  }
}

export default {
  state,
  mutations
}
