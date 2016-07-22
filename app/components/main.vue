<style>
  .main {
    height: calc(100% - 36px - 30px);
    display: flex;
  }
  .editor, .preview {
    height: 100%;
    width: 50%;
    overflow: scroll;
  }
  .editor {
    cursor: text;
    & .CodeMirror {
      background-color: white !important;
      padding: 0 10px;
      height: 100%;
    }
  }
  .preview {
    padding-right: 10px;
    & .markdown-body {
      overflow: scroll;
    }
  }
</style>

<template>
  <div class="main">
    <div class="editor">
      <textarea id="editor" v-el:editor>{{ content }}</textarea>
    </div>
    <div class="preview">
      <div class="markdown-body">
        {{{ html }}}
      </div>
    </div>
  </div>
</template>

<script>
  import CodeMirror from 'codemirror'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/mode/markdown/markdown'
  import 'codemirror/mode/gfm/gfm'
  import 'codemirror/theme/base16-light'
  import 'codemirror/addon/edit/continuelist'
  import MarkdownIt from 'markdown-it'

  import {$} from 'utils/dom'

  const md = new MarkdownIt()

  export default {
    vuex: {
      getters: {
        content: state => state.editor.content
      }
    },
    data() {
      return {
        html: ''
      }
    },
    ready() {
      this.initEditor()
    },
    methods: {
      initEditor() {
        const editor = CodeMirror.fromTextArea(this.$els.editor, {
          mode: 'gfm',
          theme: 'base16-light',
          lineNumbers: false,
          matchBrackets: true,
          lineWrapping: true,
          extraKeys: {
            "Enter": "newlineAndIndentContinueMarkdownList"
          }
        })

        editor.on('change', e => {
          this.$store.dispatch('UPDATE_CONTENT', e.getValue())
          this.html = md.render(this.content)
          this.handleScroll()
        })

        $('.CodeMirror-scroll').addEventListener('scroll', this.handleScroll)
      },
      handleScroll(e) {
        const codePort = e ? e.target : $('.CodeMirror-scroll')
        const previewPort = $('.preview')
        const markdownPort = $('.markdown-body')
        const codeContent = $('.CodeMirror-sizer')

        const codeHeight = codeContent.clientHeight - codePort.clientHeight
        const markdownHeight = markdownPort.clientHeight
        const ratio = markdownHeight / codeHeight

        const previewPosition = codePort.scrollTop * ratio
        previewPort.scrollTop = previewPosition
      }
    }
  }
</script>
