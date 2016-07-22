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

export default md
