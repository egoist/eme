const state = {
  wordCount: 0,
  content: ''
}

const mutations = {
  UPDATE_CONTENT(state, content) {
    state.content = content
    const matchWords = content.match(/[\u00ff-\uffff]|\S+/g)
    state.wordCount = matchWords ? matchWords.length : 0
  }
}

export default {
  state,
  mutations
}
