import path from 'path'

const state = {
  wordCount: 0,
  content: '',
  filePath: '',
  saved: true
}

const mutations = {
  UPDATE_CONTENT(state, content) {
    state.content = content
    const matchWords = content.match(/[\u00ff-\uffff]|\S+/g)
    state.wordCount = matchWords ? matchWords.length : 0
  },
  UPDATE_FILE_PATH(state, filePath) {
    state.filePath = filePath
    document.title = `${path.basename(filePath)} - EME`
  },
  UPDATE_SAVE_STATUS(state, saved) {
    state.saved = saved
    const fileName = state.filePath ? path.basename(state.filePath) : 'untitled'
    if (saved) {
      document.title = `${fileName} - EME`
    } else {
      document.title = `${fileName} * - EME`
    }
  }
}

export default {
  state,
  mutations
}
