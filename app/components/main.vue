<style src="codemirror/theme/base16-light"></style>
<style src="highlight.js/styles/github"></style>
<style src="../css/editor-scrollbar"></style>

<style>
  .main {
    /* total - header - footer */
    height: calc(100% - 36px - 25px);
    display: flex;
    &.not-mac {
      height: calc(100% - 25px);
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
    pre {
      tab-size: 2;
    }
  }
</style>

<template>
  <div class="main" :class="{'not-mac': !isMac}">
    <div class="editor" :class="{'focus-mode': isFocusMode}">
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
  import 'codemirror/addon/edit/continuelist'
  import 'codemirror/addon/scroll/simplescrollbars'
  import 'codemirror/addon/selection/active-line'

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
        isMac,
        isFocusMode: false
      }
    },
    created() {
      document.title = 'untitled - EME'
    },
    ready() {
      this.initEditor()

      this.listenIpc()
      this.preventBeingClosed()
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
      handleOpen(filePath) {
        const openFile = filePath => {
          fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) {
              return console.log(err)
            }
            this.editor.getDoc().setValue(content)
            this.$store.dispatch('UPDATE_CONTENT', content)
            this.$store.dispatch('UPDATE_FILE_PATH', filePath)
            this.updateSaved(true)
          })
        }
        if (filePath) {
          openFile(filePath)
        } else {
          remote.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
              {name: 'Markdown', extensions: ['markdown', 'md']}
            ]
          }, files => {
            if (files) openFile(files[0])
          })
        }
      },
      listenIpc() {
        ipcRenderer.on('file-save', () => {
          this.handleSave()
        })

        ipcRenderer.on('open-file', (e, filePath) => {
          console.log(filePath)
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

        ipcRenderer.on('toggle-focus-mode', () => {
          this.isFocusMode = !this.isFocusMode
          this.editor.setOption('styleActiveLine', this.isFocusMode)
        })

        ipcRenderer.on('win-focus', () => {
          this.editor.focus()
        })
      },
      preventBeingClosed() {
        window.onbeforeunload = () => {
          if (!this.saved) {
            const clickedButton = remote.dialog.showMessageBox({
              type: 'question',
              title: 'EME',
              message: 'Save before close?',
              buttons: ['Yes', 'No', 'Cancel']
            })
            if (clickedButton === 0) {
              this.handleSave(() => {
                ipcRenderer.send('close-focus-window')
              })
              return false
            } else if (clickedButton === 1) {
              return
            } else {
              return false
            }
          }
        }
      }
    }
  }
</script>
