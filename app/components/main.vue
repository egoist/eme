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
    .CodeMirror {
      background-color: white !important;
      padding: 0 10px;
      height: 100%;
    }
  }
  .preview {
    padding-right: 10px;
    .markdown-body {
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
  import fs from 'fs'
  import {ipcRenderer, remote} from 'electron'
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
        content: state => state.editor.content,
        filePath: state => state.editor.filePath,
        saved: state => state.editor.saved
      },
      actions: {
        updateSaved({dispatch}, saved) {
          dispatch('UPDATE_SAVE_STATUS', saved)
        }
      }
    },
    data() {
      return {
        html: '',
        saved: true
      }
    },
    ready() {
      this.initEditor()

      this.listenIpc()
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
          this.updateSaved(false)
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
      },
      listenIpc() {
        ipcRenderer.on('file-save', () => {
          if (!this.filePath) {
            remote.dialog.showSaveDialog({
              filters: [
                {name: 'Custom File Type', extensions: ['markdown', 'md', 'txt']}
              ]
            }, filename => {
              this.$store.dispatch('UPDATE_FILE_PATH', filename)
              fs.writeFile(filename, this.content, 'utf8', err => {
                if (err) {
                  this.updateSaved(false)
                  alert(err)
                } else {
                  console.log(`saved as ${filename}`)
                  this.updateSaved(true)
                }
              })
            })
          } else {
            fs.writeFile(this.filePath, this.content, 'utf8', err => {
              if (err) {
                this.updateSaved(false)
                alert(err)
              } else {
                console.log(`saved as ${this.filePath}`)
                this.updateSaved(true)
              }
            })
          }
        })
      }
    }
  }
</script>
