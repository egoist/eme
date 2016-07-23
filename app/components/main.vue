<style src="../css/editor-scrollbar"></style>

<style>
  .main {
    height: calc(100% - 36px - 30px);
    display: flex;
    &.not-mac {
      height: calc(100% - 30px);
      .preview {
        padding: 10px;
      }
      .editor {
        .CodeMirror {
          padding: 10px;
        }
      }
    }
  }
  .editor, .preview {
    height: 100%;
    width: 50%;
    overflow: auto;
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
    padding: 0 10px;
    &::-webkit-scrollbar {
      width: 0;
    }
  }
</style>

<template>
  <div class="main" :class="{'not-mac': !isMac}">
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
  import 'codemirror/addon/scroll/simplescrollbars'

  import md from 'utils/markdown'
  import {$} from 'utils/dom'
  import {isMac} from 'utils/os'


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
        editor: null,
        isMac
      }
    },
    created() {
      document.title = 'untitled - EME'
    },
    ready() {
      this.initEditor()

      this.listenIpc()
    },
    methods: {
      initEditor() {
        this.editor = CodeMirror.fromTextArea(this.$els.editor, {
          mode: 'gfm',
          theme: 'base16-light',
          lineNumbers: false,
          matchBrackets: true,
          lineWrapping: true,
          scrollbarStyle: 'simple',
          autofocus: true,
          extraKeys: {
            "Enter": "newlineAndIndentContinueMarkdownList"
          }
        })

        this.editor.on('change', e => {
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
      save(filePath, cb) {
        this.$store.dispatch('UPDATE_FILE_PATH', filePath)
        fs.writeFile(filePath, this.content, 'utf8', err => {
          if (err) {
            this.updateSaved(false)
            console.log(err)
          } else {
            console.log(`saved as ${filePath}`)
            this.updateSaved(true)
            if (cb) cb()
          }
        })
      },
      handleSave(cb) {
        if (this.filePath) {
          this.save(this.filePath, cb)
        } else {
          remote.dialog.showSaveDialog({
            filters: [
              {name: 'Markdown', extensions: ['markdown', 'md']}
            ]
          }, filePath => {
            this.save(filePath, cb)
          })
        }
      },
      handleSaveAs() {
        remote.dialog.showSaveDialog({
          filters: [
            {name: 'Markdown', extensions: ['markdown', 'md']}
          ]
        }, filePath => {
          fs.writeFile(filePath, this.content, 'utf8', err => {
            if (err) {
              console.log(err)
            } else {
              console.log(`saved as ... ${filePath}`)
            }
          })
        })
      },
      handleOpen() {
        remote.dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [
            {name: 'Markdown', extensions: ['markdown', 'md']}
          ]
        }, files => {
          const filePath = files[0]
          fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) {
              return console.log(err)
            }
            this.editor.getDoc().setValue(content)
            this.$store.dispatch('UPDATE_CONTENT', content)
            this.$store.dispatch('UPDATE_FILE_PATH', filePath)
            this.updateSaved(true)
          })
        })
      },
      listenIpc() {
        ipcRenderer.on('file-save', () => {
          this.handleSave()
        })

        ipcRenderer.on('open-file', () => {
          if (!this.saved) {
            remote.dialog.showMessageBox({
              type: 'question',
              title: 'EME',
              message: 'Save changes to file?',
              buttons: ['Yes', 'No', 'Cancel']
            }, clickedButton => {
              if (clickedButton === 0) {
                this.handleSave(this.handleOpen)
              } else if (clickedButton === 1) {
                this.handleOpen()
              }
            })
          } else {
            this.handleOpen()
          }
        })

        ipcRenderer.on('file-save-as', () => {
          this.handleSaveAs()
        })
      }
    }
  }
</script>
