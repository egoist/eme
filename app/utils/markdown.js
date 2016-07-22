import MarkdownIt from 'markdown-it'
import taskList from 'markdown-it-task-lists'
import katex from './vendor/markdown-it-katex'

const md = new MarkdownIt({
  html: true,
  xhtmlOut: false,
  breaks: true,
  langPrefix: 'language-',
  linkify: true,
  typographer: true,
  quotes: '“”‘’',
  highlight(/*str, lang*/) { return '' }
})

md.use(taskList)
md.use(katex)

// add target _blank
const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  var aIndex = tokens[idx].attrIndex('target')

  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank'])
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank'
  }

  return defaultRender(tokens, idx, options, env, self)
}

export default md
