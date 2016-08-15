<style src="../css/base16-light"></style>
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
    flex: 1;
    overflow: auto;
  }
  .editor {
    cursor: text;
    .editor-input {
      display: none;
    }
    .CodeMirror {
      background-color: white !important;
      height: 100%;
    }
    .CodeMirror-scroll {
      padding-bottom: 15px;
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
    <div
      class="editor"
      :class="{'focus-mode': tab.isFocusMode}"
      v-show="currentTab && currentTab.writingMode !== 'preview'">
      <textarea class="editor-input" :id="'editor-' + $index">{{ tab.content }}</textarea>
    </div>
    <div
      :class="'preview preview-' + $index"
      v-show="currentTab && currentTab.writingMode !== 'writing'">
      <div :class="'markdown-body markdown-body-' + $index">
        {{{ tab.html }}}
      </div>
    </div>
  </div>
</template>

<script>
  import path from 'path'
  import pify from 'pify'
  import {ipcRenderer, remote} from 'electron'
  import CodeMirror from 'codemirror'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/mode/markdown/markdown'
  import 'codemirror/mode/gfm/gfm'
  import 'codemirror/addon/edit/continuelist'
  import 'codemirror/addon/scroll/simplescrollbars'
  import 'codemirror/addon/selection/active-line'
  import 'codemirror/keymap/vim'

  import {$} from 'utils/dom'
  import {isMac} from 'utils/os'
  import md from 'utils/markdown'
  import event from 'utils/event'
  import {
    getWordCount
  } from 'utils/common'
  import makeHTML from 'utils/make-html'
  import fs from 'utils/fs-promise'
  import {appPath} from 'utils/resolve-path'

  const currentWindow = remote.getCurrentWindow()

  export default {
    vuex: {
      getters: {
        tabs: state => state.editor.tabs,
        currentTabIndex: state => state.editor.currentTabIndex,
        currentTab: state => state.editor.tabs[state.editor.currentTabIndex]
      },
      actions: {
        updateSaved({dispatch}, payload) {
          dispatch('UPDATE_SAVE_STATUS', payload)
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
      this.createNewTab()

      this.listenIpc()
      this.handleDrag()
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
      async save({index, filePath}) {
        const tab = this.tabs[index]
        this.$store.dispatch('UPDATE_FILE_PATH', {
          index,
          filePath
        })
        await fs.writeFile(filePath, tab.content, 'utf8')
        console.log(`saved as ${filePath}`)
        this.updateSaved({index, saved: true})
      },
      async handleSave(index) {
        const tab = this.tabs[index]
        if (tab.filePath) {
          await this.save({index, filePath: tab.filePath})
        } else {
          const filePath = remote.dialog.showSaveDialog(currentWindow, {
            filters: [
              {name: 'Markdown', extensions: ['markdown', 'md']}
            ]
          })
          if (filePath) await this.save({index, filePath})
        }
      },
      async handleSaveAs(index) {
        const tab = this.tabs[index]
        const filePath = remote.dialog.showSaveDialog(currentWindow, {
          filters: [
            {name: 'Markdown', extensions: ['markdown', 'md']}
          ]
        })
        await fs.writeFile(filePath, tab.content, 'utf8')
        console.log(`saved as ... ${filePath}`)
      },
      async overrideTab(filePath) {
        const index = this.currentTabIndex
        const content = await fs.readFile(filePath, 'utf8')
        this.editor.getDoc().setValue(content)
        this.$store.dispatch('UPDATE_CONTENT', {
          index,
          content
        })
        this.$store.dispatch('UPDATE_FILE_PATH', {
          index,
          filePath
        })
        this.updateSaved({
          index,
          saved: true
        })
      },
      async createNewTab(filePath = '') {
        let content = ''
        let html = ''
        let wordCount = 0
        if (filePath) {
          content = await fs.readFile(filePath, 'utf8')
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
          isFocusMode: false,
          writingMode: 'default',
          isVimMode: false,
          pdf: ''
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
            dragDrop: false,
            extraKeys: {
              "Enter": "newlineAndIndentContinueMarkdownList"
            }
          })

          setTimeout(() => {
            editor.refresh()
            editor.focus()
          }, 0)

          editor.on('change', e => {
            this.updateSaved({
              index: this.currentTabIndex,
              saved: false
            })
            this.$store.dispatch('UPDATE_CONTENT', {
              index: this.currentTabIndex,
              content: e.getValue()
            })
            this.handleScroll()
          })

          this.$store.dispatch('SET_EDITOR', {index, editor})

          tabEl.querySelector('.CodeMirror-scroll').addEventListener('scroll', this.handleScroll)
        }, 0)
      },
      handleOpen(filePath) {
        const openFile = filePath => {
          ipcRenderer.send('add-recent-file', filePath)
          if (this.currentTab && this.currentTab.saved && !this.currentTab.filePath) {
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
          const files = remote.dialog.showOpenDialog(currentWindow, {
            properties: ['openFile'],
            filters: [
              {name: 'Markdown', extensions: ['markdown', 'md']}
            ]
          })
          if (files) openFile(files[0])
        }
      },
      listenIpc() {
        ipcRenderer.on('file-save', () => {
          this.handleSave(this.currentTabIndex)
        })

        ipcRenderer.on('open-file', (e, filePath) => {
          this.handleOpen(filePath)
        })

        ipcRenderer.on('file-save-as', () => {
          this.handleSaveAs(this.currentTabIndex)
        })

        ipcRenderer.on('toggle-focus-mode', () => {
          this.currentTab.isFocusMode = !this.currentTab.isFocusMode
          this.editor.setOption('styleActiveLine', this.currentTab.isFocusMode)
        })

        ipcRenderer.on('toggle-vim-mode', () => {
          if (this.currentTab.isVimMode) {
            this.editor.setOption('keyMap', 'default')
          } else {
            this.editor.setOption('keyMap', 'vim')
          }
          this.currentTab.isVimMode = !this.currentTab.isVimMode
        })

        ipcRenderer.on('win-focus', () => {
          if (this.editor) this.editor.focus()
        })

        ipcRenderer.on('close-current-tab', () => {
          if (this.tabs.length === 0) {
            currentWindow.destroy()
          } else {
            this.closeTab(this.currentTabIndex)
          }
        })

        ipcRenderer.on('new-tab', (e, filePath) => {
          this.createNewTab(filePath)
        })

        ipcRenderer.on('close-window', () => {

          const closeInOrder = () => {
            this.closeTab(0).then(() => {
              if (this.tabs.length > 0) {
                closeInOrder()
              } else {
                currentWindow.close()
              }
            })
          }

          closeInOrder()
        })

        window.onbeforeunload = () => {
          if (currentWindow.$state.unsaved === 0) {
            return
          } else {
            return false
          }
        }

        ipcRenderer.on('close-and-exit', () => {

          const closeInOrder = () => {
            this.closeTab(0).then(() => {
              if (this.tabs.length > 0) {
                closeInOrder()
              } else {
                // any better solution?
                remote.app.exit(0)
              }
            })
          }

          closeInOrder()
        })

        ipcRenderer.on('show-save-pdf-dialog', () => {
          const filePath = remote.dialog.showSaveDialog(currentWindow, {
            filters: [
              {name: 'PDF', extensions: ['pdf']}
            ]
          })
          if (filePath) {
            const html = makeHTML({
              html: `<div class="markdown-body">${this.currentTab.html}</div>`,
              css: appPath('vendor/github-markdown-css/github-markdown.css')
            })
            ipcRenderer.send('print-to-pdf', html, filePath)
          }
        })

        ipcRenderer.on('finish-exporting-pdf', (e, err, filePath) => {
          if (!err) {
            this.$store.dispatch('UPDATE_PDF', {
              index: this.currentTabIndex,
              pdf: filePath
            })
          }
        })

        event.on('new-tab', () => {
          this.createNewTab()
        })

        event.on('close-tab', index => {
          this.closeTab(index)
        })

        event.on('focus-current-tab', () => {
          this.editor.refresh()
          this.editor.focus()
        })
      },
      async closeTab(index) {
        const tab = this.tabs[index]
        if (tab && !tab.saved) {
          const filename = tab.filePath ? path.basename(tab.filePath) : 'untitled'
          const clickedButton = remote.dialog.showMessageBox(currentWindow, {
            type: 'question',
            title: 'EME',
            message: `Do you want to save the changes you made to ${filename} ?`,
            detail: 'Your changes will be lost if you don\'t save them.',
            buttons: ['Save', 'Cancel', 'Don\'t Save']
          })
          if (clickedButton === 0) {
            await this.handleSave(index)
          } else if (clickedButton === 2) {
            this.$store.dispatch('UPDATE_SAVE_STATUS', {index, saved: true})
          }
        }
        this.$store.dispatch('CLOSE_TAB', index)
      },
      handleDrag() {
        const holder = $('#app')

        holder.ondragover = () => {
          return false
        }
        holder.ondragleave = holder.ondragend = () => {
          return false
        }

        holder.ondrop = e => {
          e.preventDefault()
          for (let f of e.dataTransfer.files) {
            this.createNewTab(f.path)
          }
          return false
        }
      }
    }
  }
</script>
