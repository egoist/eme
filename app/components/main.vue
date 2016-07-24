<style src="codemirror/theme/base16-light"></style>
<style src="highlight.js/styles/github"></style>
<style src="../css/editor-scrollbar"></style>

<style>
  .main {
    /* total - header - footer */
    height: calc(100% - 36px - 25px);
    display: flex;
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
      height: 100%;
    }
    .CodeMirror-sizer {
      padding-left: 10px;
      padding-top: 10px;
    }
  }
  .preview {
    padding: 10px;
    &::-webkit-scrollbar {
      width: 0;
    }
    pre {
      tab-size: 2;
    }
  }
</style>

<template>
  <div
    class="main tab-body"
    :class="'tab-body-' + $index"
    v-for="tab in tabs"
    v-show="$index === currentTabIndex">
    <div class="editor" v-show="editor" :class="{'focus-mode': tab.isFocusMode}">
      <textarea :id="'editor-' + $index">{{ tab.content }}</textarea>
    </div>
    <div :class="'preview preview-' + $index">
      <div :class="'markdown-body markdown-body-' + $index">
        {{{ tab.html }}}
      </div>
    </div>
  </div>
</template>

<script>
  import fs from 'fs'
  import pify from 'pify'
  import {ipcRenderer, remote} from 'electron'
  import CodeMirror from 'codemirror'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/mode/markdown/markdown'
  import 'codemirror/mode/gfm/gfm'
  import 'codemirror/addon/edit/continuelist'
  import 'codemirror/addon/scroll/simplescrollbars'
  import 'codemirror/addon/selection/active-line'

  import {$} from 'utils/dom'
  import {isMac} from 'utils/os'
  import md from 'utils/markdown'
  import event from 'utils/event'
  import {
    getWordCount
  } from 'utils/common'

  export default {
    vuex: {
      getters: {
        tabs: state => state.editor.tabs,
        currentTabIndex: state => state.editor.currentTabIndex,
        currentTab: state => state.editor.tabs[state.editor.currentTabIndex]
      },
      actions: {
        updateSaved({dispatch}, saved) {
          dispatch('UPDATE_SAVE_STATUS', saved)
        }
      }
    },
    computed: {
      editor (){
        return this.currentTab && this.currentTab.editor
      }
    },
    data() {
      return {
        isMac
      }
    },
    created() {
      document.title = 'untitled - EME'
    },
    ready() {
      this.createNewTab().catch(e => console.log(e.stack))

      this.listenIpc()
    },
    methods: {
      handleScroll(e) {
        const index = this.currentTabIndex
        const codePort = e ?
          e.target :
          $(`.tab-body-${index}`).querySelector('.CodeMirror-scroll')
        const previewPort = $(`.preview-${index}`)
        const markdownPort = $(`.markdown-body-${index}`)
        const codeContent = $(`.tab-body-${index}`).querySelector('.CodeMirror-sizer')
        const codeHeight = codeContent.clientHeight - codePort.clientHeight
        const markdownHeight = markdownPort.clientHeight
        const ratio = markdownHeight / codeHeight
        const previewPosition = codePort.scrollTop * ratio
        previewPort.scrollTop = previewPosition
      },
      save(filePath, cb) {
        this.$store.dispatch('UPDATE_FILE_PATH', filePath)
        fs.writeFile(filePath, this.currentTab.content, 'utf8', err => {
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
        if (this.currentTab.filePath) {
          this.save(this.currentTab.filePath, cb)
        } else {
          remote.dialog.showSaveDialog({
            filters: [
              {name: 'Markdown', extensions: ['markdown', 'md']}
            ]
          }, filePath => {
            if (filePath) this.save(filePath, cb)
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
      async overrideTab(filePath) {
        const content = await pify(fs.readFile)(filePath, 'utf8')
        this.editor.getDoc().setValue(content)
        this.$store.dispatch('UPDATE_CONTENT', content)
        this.$store.dispatch('UPDATE_FILE_PATH', filePath)
        this.updateSaved(true)
      },
      async createNewTab(filePath = '') {
        let content = ''
        let html = ''
        let wordCount = 0
        if (filePath) {
          content = await pify(fs.readFile)(filePath, 'utf8')
          html = md.render(content)
          wordCount = getWordCount(content)
        }
        const index = this.tabs.length
        this.$store.dispatch('INIT_NEW_TAB', {
          wordCount,
          content,
          html,
          filePath,
          saved: true,
          editor: null,
          isFocusMode: false
        })

        setTimeout(() => {
          const tabEl = $(`.tab-body-${index}`)
          const textarea = tabEl.querySelector(`#editor-${index}`)
          const editor = CodeMirror.fromTextArea(textarea, {
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

          setTimeout(() => {
            editor.refresh()
            editor.focus()
          }, 200)

          editor.on('change', e => {
            this.updateSaved(false)
            this.$store.dispatch('UPDATE_CONTENT', e.getValue())
            this.handleScroll()
          })

          this.$store.dispatch('SET_EDITOR', {index, editor})

          tabEl.querySelector('.CodeMirror-scroll').addEventListener('scroll', this.handleScroll)
        }, 200)
      },
      handleOpen(filePath) {
        const openFile = filePath => {
          if (this.currentTab.saved && !this.currentTab.filePath) {
            // load file in currentTab
            this.overrideTab(filePath)
          } else {
            // load file in newTab
            this.createNewTab(filePath)
          }
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
          this.handleOpen(filePath)
        })

        ipcRenderer.on('file-save-as', () => {
          this.handleSaveAs()
        })

        ipcRenderer.on('toggle-focus-mode', () => {
          this.currentTab.isFocusMode = !this.currentTab.isFocusMode
          this.editor.setOption('styleActiveLine', this.currentTab.isFocusMode)
        })

        ipcRenderer.on('win-focus', () => {
          if (this.editor) this.editor.focus()
        })

        ipcRenderer.on('close-current-tab', this.closeCurrentTab)

        ipcRenderer.on('close-all-tabs', () => {
          if (this.tabs.length === 0) {
            return remote.getCurrentWindow().hide()
          }

          const closeInOrder = () => {
            this.$store.dispatch('SET_CURRENT_TAB', 0)
            this.closeCurrentTab(null, () => {
              if (this.tabs.length > 0) {
                closeInOrder()
              } else {
                remote.getCurrentWindow().hide()
              }
            })
          }

          closeInOrder()
        })

        event.on('new-tab', () => {
          this.createNewTab()
        })

        event.on('close-current-tab', this.closeCurrentTab)

        event.on('focus-current-tab', () => {
          this.editor.focus()
        })
      },
      closeCurrentTab(e, cb) {
        if (!this.currentTab.saved) {
          const clickedButton = remote.dialog.showMessageBox({
            type: 'question',
            title: 'EME',
            message: 'Save before close?',
            buttons: ['Yes', 'No', 'Cancel']
          })
          if (clickedButton === 0) {
            this.handleSave(() => {
              this.$store.dispatch('CLOSE_TAB', this.currentTabIndex)
              if (cb) cb()
            })
          } else if (clickedButton === 1) {
            this.$store.dispatch('CLOSE_TAB', this.currentTabIndex)
            if (cb) cb()
          }
        } else {
          this.$store.dispatch('CLOSE_TAB', this.currentTabIndex)
          if (cb) cb()
        }
      }
    }
  }
</script>
