<style src="highlight.js/styles/github"></style>
<style src="../css/base16-light"></style>
<style src="../css/editor-dialog"></style>
<style src="../css/editor-scrollbar"></style>

<style>
  .main {
    /* total - header - footer */
    height: calc(100% - 36px - 25px);
    .distraction-free.full-screen & {
      height: 100%;
    }
  }
  .tab-body {
    height: 100%;
    display: flex;
    &.resizing {
      cursor: ew-resize;
      .editor {
        cursor: ew-resize;
      }
      .preview {
        -webkit-user-select: none;
      }
    }
    &.vim-mode {
      /* height - editorDialog */
      .CodeMirror-scroll {
        padding-bottom: 40px;
        height: calc(100% - 1.75rem);
      }
    }
  }
  .editor, .preview {
    min-width: 100px;
    height: 100%;
    overflow: auto;
  }
  .editor {
    cursor: text;
    overflow-x: hidden !important;
    position: relative;
    border-right: 1px solid #e3e3e3;
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
    overflow-x: hidden;
    &.preview-presentation {
      padding: 0;
    }
    &::-webkit-scrollbar {
      width: 0;
    }
    pre {
      tab-size: 2;
    }
  }
  .resize-bar {
    position: absolute;
    z-index: 99;
    top: 0;
    bottom: 0;
    right: -5px;
    width: 10px;
    cursor: ew-resize;
  }
  .writing-mode-writing .editor,
  .writing-mode-preview .preview {
    width: 100% !important;
    border-right: none;
  }
</style>

<template>
  <div class="main">
    <tip v-if="tabs.length === 0"></tip>
    <div
      class="tab-body"
      :class="[
        'tab-body-' + $index,
        writingModeClassName,
        {
          'vim-mode': currentTab && currentTab.isVimMode,
          resizing: resizing
        }
      ]"
      v-for="tab in tabs"
      @mousemove="resizeMove($event, $index)"
      @mouseup="resizeEnd"
      @mouseleave="resizeEnd"
      v-show="$index === currentTabIndex">
      <div
        class="editor"
        :class="{'focus-mode': tab.isFocusMode}"
        :style="{ width: tab.split + '%' }"
        v-show="currentTab && currentTab.writingMode !== 'preview'">
        <textarea class="editor-input" :id="'editor-' + $index">{{ tab.content }}</textarea>
        <div class="resize-bar" @mousedown="resizeStart($event, $index)"></div>
      </div>
      <div
        :class="[
          'preview',
          'preview-' + $index,
          {
            'preview-presentation': tab.isPresentationMode
          }
        ]"
        :style="{ width: (100 - tab.split) + '%' }"
        v-show="currentTab && currentTab.writingMode !== 'writing'">
        <presentation
          :slides="tab.html"
          v-if="tab.isPresentationMode && currentTabIndex === $index">
        </presentation>
        <div :class="'markdown-body markdown-body-' + $index" v-else>
          {{{ tab.html }}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import path from 'path'
  import {ipcRenderer, remote, shell} from 'electron'
  import CodeMirror from 'codemirror'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/mode/markdown/markdown'
  import 'codemirror/mode/gfm/gfm'
  import 'codemirror/mode/javascript/javascript'
  import 'codemirror/mode/clike/clike'
  import 'codemirror/mode/htmlmixed/htmlmixed'
  import 'codemirror/addon/edit/continuelist'
  import 'codemirror/addon/scroll/simplescrollbars'
  import 'codemirror/addon/selection/active-line'
  import 'codemirror/addon/dialog/dialog.js'
  import 'codemirror/keymap/vim'
  import objectPicker from 'object-picker'

  import {$} from 'utils/dom'
  import {isMac} from 'utils/os'
  import event from 'utils/event'
  import uid from 'utils/uid'
  import makeHTML from 'utils/make-html'
  import fs from 'utils/fs-promise'
  import {appPath} from 'utils/resolve-path'
  import handleError from 'utils/handle-error'
  import tip from 'components/tip'
  import presentation from 'components/presentation'

  const currentWindow = remote.getCurrentWindow()
  const config = currentWindow.$config

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
      editor() {
        return this.currentTab && this.currentTab.editor
      },
      writingModeClassName() {
        return this.currentTab ?
          `writing-mode-${this.currentTab.writingMode}` :
          'writing-mode-default'
      }
    },
    data() {
      return {
        isMac,
        resizing: false
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
      restoreAppState(state) {
        if (state.tabs.length > 0) {
          const startTabsCount = this.tabs.length
          state.tabs.forEach(tab => {
            this.createNewTab(tab, () => this.$store.dispatch('SET_CURRENT_TAB', startTabsCount + state.currentTabIndex))
          })
        }
      },
      handleScroll(e) {
        if (this.currentTab.isPresentationMode) return
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
      saveAppState({tabs, currentTabIndex}) {
        if (tabs.length === 0) {
          config.set('lastAppState', {
            currentTabIndex: null,
            tabs: []
          })
        } else {
          config.set('lastAppState', {
            currentTabIndex,
            tabs: tabs.map(tab => objectPicker(tab, [
              'filePath',
              'isFocusMode',
              'isVimMode',
              'pdf',
              'split'
            ]))
          })
        }
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
        try {
          const tab = this.tabs[index]
          const filePath = tab.filePath || remote.dialog.showSaveDialog(currentWindow, {
            filters: [
              {name: 'Markdown', extensions: ['markdown', 'md']}
            ]
          })
          if (filePath) {
            await this.save({index, filePath})
            ipcRenderer.send('add-recent-file', filePath)
            return true
          }
        } catch (err) {
          handleError(err)
        }
      },
      async handleSaveAs(index) {
        const tab = this.tabs[index]
        const filePath = remote.dialog.showSaveDialog(currentWindow, {
          filters: [
            {name: 'Markdown', extensions: ['markdown', 'md']}
          ]
        })
        if (filePath) {
          await fs.writeFile(filePath, tab.content, 'utf8')
          console.log(`saved as ... ${filePath}`)
        }
      },
      async handleRename(index) {
        const tab = this.tabs[index]
        if (tab.filePath) {
          this.$store.dispatch('UPDATE_RENAME_STATUS', {
            index,
            rename: true
          })
          setTimeout(() => {
            $('.current-tab').querySelector('.rename-input').focus()
          }, 0)
        } else {
          this.handleSave(index).catch(handleError)
        }
      },
      async handleRenamed(name, index) {
        const tab = this.tabs[index]
        const newPath = path.join(path.dirname(tab.filePath), name)

        this.$store.dispatch('UPDATE_RENAME_STATUS', {
          index,
          rename: false
        })

        if (newPath === tab.filePath) return

        try {
          await fs.access(newPath, fs.constants.F_OK)
          handleError({
            name: 'Rename Error',
            message: `"${name}" already exists.`
          })
        } catch (e) {
          await fs.rename(tab.filePath, newPath)
          this.$store.dispatch('UPDATE_FILE_PATH', {
            index,
            filePath: newPath
          })
          console.log(`rename as ... ${newPath}`)
        }
      },
      async overrideTab(filePath) {
        const index = this.currentTabIndex
        const content = await fs.readFile(filePath, 'utf8')
        this.editor.getDoc().setValue(content)
        this.$store.dispatch('UPDATE_CONTENT_WITH_FILEPATH', {
          index,
          content,
          filePath
        })
        this.updateSaved({
          index,
          saved: true
        })
      },
      async createNewTab(tab = {}, created = () => {}) {
        let content = ''
        const filePath = tab.filePath || ''
        if (filePath) {
          content = await fs.readFile(filePath, 'utf8')
        }
        const index = this.tabs.length
        const tabDefaults = {
          content,
          saved: true,
          editor: null,
          isFocusMode: false,
          writingMode: 'default',
          isVimMode: false,
          isPresentationMode: false,
          pdf: '',
          rename: false,
          split: 50,
          uid: uid(),
          slideIndex: 0,
          isSlideSwitching: false,
          slideDirection: 'left'
        }
        this.$store.dispatch('INIT_NEW_TAB', {
          ...tabDefaults,
          ...tab,
          filePath
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
            tabSize: 2,
            extraKeys: {
              Enter: 'newlineAndIndentContinueMarkdownList',
              Tab(cm) {
                const spaces = Array(cm.getOption('indentUnit') + 1).join(' ')
                cm.replaceSelection(spaces)
              }
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
          created()
        }, 0)
      },
      handleOpen(filePath) {
        const openFile = filePath => {
          ipcRenderer.send('add-recent-file', filePath)
          if (this.currentTab && this.currentTab.saved && !this.currentTab.filePath) {
            // load file in currentTab
            this.overrideTab(filePath).catch(handleError)
          } else {
            // load file in newTab
            this.createNewTab({filePath}).catch(handleError)
          }
        }
        if (filePath) {
          if (!this.tabs.find(tab => tab.filePath === filePath)) {
            openFile(filePath)
          }
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
          this.handleSave(this.currentTabIndex).catch(handleError)
        })

        ipcRenderer.on('open-file', (e, filePath) => {
          this.handleOpen(filePath)
        })

        ipcRenderer.on('open-last-session', () => {
          const lastAppState = config.get('lastAppState')
          if (lastAppState && lastAppState.tabs) {
            this.restoreAppState(lastAppState)
          }
        })

        ipcRenderer.on('file-save-as', () => {
          this.handleSaveAs(this.currentTabIndex).catch(handleError)
        })

        ipcRenderer.on('file-rename', () => {
          this.handleRename(this.currentTabIndex)
        })

        ipcRenderer.on('toggle-focus-mode', () => {
          this.editor.setOption('styleActiveLine', !this.currentTab.isFocusMode)
          this.$store.dispatch('TOGGLE_FOCUS_MODE')
        })

        ipcRenderer.on('toggle-presentation-mode', () => {
          this.$store.dispatch('TOGGLE_PRESENTATION_MODE')
        })

        ipcRenderer.on('toggle-vim-mode', () => {
          if (this.currentTab.isVimMode) {
            this.editor.setOption('keyMap', 'default')
          } else {
            this.editor.setOption('keyMap', 'vim')
          }
          this.$store.dispatch('TOGGLE_VIM_MODE')
        })

        ipcRenderer.on('win-focus', () => {
          if (this.editor) this.editor.focus()
        })

        ipcRenderer.on('close-current-tab', () => {
          if (this.tabs.length === 0) {
            currentWindow.destroy()
          } else {
            this.closeTab(this.currentTabIndex).then(() => {
              event.emit('update-tabs')
            })
          }
        })

        ipcRenderer.on('new-tab', (e, filePath) => {
          this.createNewTab({filePath}, () => {
            event.emit('update-tabs')
          }).catch(handleError)
        })

        ipcRenderer.on('close-window', () => {
          const tabs = []
          const currentTabIndex = this.currentTabIndex
          const closeInOrder = callback => {
            const tab = this.tabs[0]
            this.closeTab(0).then(closed => {
              if (closed) {
                if (closed.saved && tab) {
                  tabs.push(tab)
                }
                if (this.tabs.length > 0) {
                  closeInOrder(callback)
                } else {
                  callback()
                  currentWindow.close()
                }
              }
            })
          }

          closeInOrder(() => this.saveAppState({tabs, currentTabIndex}))
        })

        window.onbeforeunload = () => {
          if (currentWindow.$state.unsaved === 0) {
            return
          }
          return false
        }

        ipcRenderer.on('close-and-exit', () => {
          const tabs = []
          const currentTabIndex = this.currentTabIndex
          const closeInOrder = callback => {
            const tab = this.tabs[0]
            this.closeTab(0).then(closed => {
              if (closed) {
                if (closed.saved && tab) {
                  tabs.push(tab)
                }
                if (this.tabs.length > 0) {
                  closeInOrder(callback)
                } else {
                  // any better solution?
                  callback()
                  remote.app.exit(0)
                }
              }
            })
          }

          closeInOrder(() => this.saveAppState({tabs, currentTabIndex}))
        })

        ipcRenderer.on('show-save-pdf-dialog', () => {
          const filePath = remote.dialog.showSaveDialog(currentWindow, {
            filters: [
              {name: 'PDF', extensions: ['pdf']}
            ]
          })
          if (filePath) {
            const html = makeHTML({
              html: this.currentTab.html,
              css: [
                appPath('vendor/github-markdown-css/github-markdown.css'),
                appPath('vendor/katex/katex.min.css'),
                appPath('vendor/css/print.css'),
                appPath('dist/presentation.css')
              ],
              data: {
                saveTo: filePath,
                attrs: this.currentTab.attrs || {}
              }
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
            const notie = new Notification('PDF exported!', {
              body: filePath
            })
            notie.onclick = e => {
              e.preventDefault()
              shell.showItemInFolder(filePath)
            }
          }
        })

        event.on('new-tab', callback => {
          this.createNewTab({}, callback)
        })

        event.on('close-tab', index => {
          this.closeTab(index).then(() => {
            event.emit('update-tabs')
          })
        })

        event.on('file-rename', (index, name) => {
          this.handleRenamed(index, name)
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
            const saved = await this.handleSave(index)
            if (saved) {
              this.$store.dispatch('CLOSE_TAB', index)
              return {saved: true}
            }
          } else if (clickedButton === 2) {
            this.$store.dispatch('UPDATE_SAVE_STATUS', {index, saved: true})
            this.$store.dispatch('CLOSE_TAB', index)
            return {saved: false}
          }
          return false
        }
        if (tab) {
          this.$store.dispatch('CLOSE_TAB', index)
        }
        return {saved: true}
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
          for (const f of e.dataTransfer.files) {
            this.createNewTab({filePath: f.path})
          }
          return false
        }
      },
      resizeStart(e, index) {
        this.resizing = true
        this.startX = e.pageX
        this.startSplit = this.tabs[index].split
      },
      resizeMove(e, index) {
        if (this.resizing) {
          const dx = e.pageX - this.startX
          const totalWidth = this.$el.parentNode.offsetWidth
          this.$store.dispatch('UPDATE_EDITOR_SPLIT', {
            index,
            split: this.startSplit + (dx / totalWidth * 100)
          })
        }
      },
      resizeEnd() {
        this.resizing = false
        this.editor.refresh()
        this.editor.focus()
      }
    },
    components: {
      tip,
      presentation
    }
  }
</script>
