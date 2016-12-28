/* eslint-disable camelcase, max-params */
import MarkdownIt from 'markdown-it'
import taskList from 'markdown-it-task-lists'
import hljs from 'highlight.js/lib/highlight'
import frontMatter from 'markdown-it-front-matter'
import katex from './vendor/markdown-it-katex'

const langs = [
  'cpp',
  'coffeescript',
  'css',
  'dockerfile',
  'elixir',
  'elm',
  'erlang',
  'go',
  'haskell',
  'ini',
  'javascript',
  'less',
  'lua',
  'makefile',
  'livescript',
  'markdown',
  'matlab',
  'nginx',
  'ocaml',
  'perl',
  'php',
  'python',
  'ruby',
  'scala',
  'rust',
  'scss',
  'sql',
  'stylus',
  'swift',
  'typescript',
  'xml',
  'yaml'
]

langs.forEach(lang => {
  hljs.registerLanguage(lang, require(`highlight.js/lib/languages/${lang}`))
})

const md = new MarkdownIt({
  html: true,
  xhtmlOut: false,
  breaks: true,
  langPrefix: 'language-',
  linkify: true,
  typographer: true,
  quotes: '“”‘’',
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value
      } catch (__) {}
    }

    return ''
  }
})

md.use(taskList)
md.use(katex)
md.use(frontMatter, fm => console.log(fm))

// add target _blank
const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const aIndex = tokens[idx].attrIndex('target')

  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank'])
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank'
  }

  return defaultRender(tokens, idx, options, env, self)
}

export default md
