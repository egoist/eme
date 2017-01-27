<!-- codemirror theme -->
<style src="src/css/codemirror/tomorrow-night-bright"></style>
<style src="src/css/codemirror/base16-light"></style>
<style src="src/css/codemirror/editor-dialog"></style>
<style src="src/css/codemirror/editor-scrollbar"></style>
<style src="src/css/codemirror/editor-reset"></style>
<!-- highlight.js theme -->
<style src="src/css/highlight/github"></style>
<style src="src/css/highlight/tomorrow-night-bright"></style>

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
    border-right: 1px solid;
    .editor-input {
      display: none;
    }
    .CodeMirror {
      background-color: white !important;
      height: 100%;
    }
    .CodeMirror-scroll {
      padding-bottom: 17px;
    }
    .CodeMirror-sizer {
      padding-left: 10px;
      padding-top: 10px;
    }
  }
  .preview {
    padding: 10px;
    overflow-x: hidden;
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
      v-for="(tab, index) in tabs"
      :key="tab.id"
      class="tab-body"
      :class="[
        'tab-body-' + index,
        writingModeClassName,
        {
          'vim-mode': currentTab && currentTab.isVimMode,
          resizing: resizing
        }
      ]"
      @mousemove="resizeMove($event, index)"
      @mouseup="resizeEnd"
      @mouseleave="resizeEnd"
      v-show="index === currentTabIndex">
      <div
        class="editor"
        :class="{'focus-mode': tab.isFocusMode}"
        :style="{
          'font-family': settings.editor.font,
          width: getSplitWidth('editor'),
          'font-size': settings.editor.fontSize + 'px',
          'border-right-width': currentTab && currentTab.writingMode === 'default' ? '1px' : '0'
        }"
        v-show="currentTab && currentTab.writingMode !== 'preview'">
        <textarea class="editor-input" :id="'editor-' + index">{{ tab.content }}</textarea>
        <div class="resize-bar" @mousedown="resizeStart($event, index)"></div>
      </div>
      <div
        :class="[
          'preview',
          'preview-' + index
        ]"
        :style="{
          width: getSplitWidth('preview'),
          'font-family': settings.preview.font
        }"
        v-show="currentTab && currentTab.writingMode !== 'editor'">
        <div
          :class="'markdown-body markdown-body-' + index"
          :style="{'font-size': settings.preview.fontSize + 'px'}"
          v-html="tab.html">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import path from 'path'
  import {ipcRenderer, remote, shell} from 'electron'
  import objectPicker from 'object-picker'

  import CodeMirror from 'codemirror/lib/codemirror'
  import 'codemirror/addon/scroll/simplescrollbars.js'
  import 'codemirror/mode/markdown/markdown'
  import 'codemirror/mode/gfm/gfm'
  import 'codemirror/mode/javascript/javascript'
  import 'codemirror/mode/clike/clike'
  import 'codemirror/mode/htmlmixed/htmlmixed'
  import 'codemirror/addon/edit/continuelist'
  import 'codemirror/addon/selection/active-line.js'
  import 'codemirror/addon/dialog/dialog.js'
  import 'codemirror/addon/search/search.js'
  import 'codemirror/addon/search/searchcursor.js'
  import 'codemirror/addon/search/jump-to-line.js'
  import 'codemirror/keymap/vim'

  import {$} from 'utils/dom'
  import event from 'utils/event'
  import makeHTML from 'utils/make-html'
  import fs from 'utils/fs-promise'
  import nfs from 'fs'
  import {appPath} from 'utils/resolve-path'
  import handleError from 'utils/handle-error'
  import dialog from 'utils/dialog'
  import {createOrUpdateGist} from 'utils/gist'
  import tip from 'components/tip'
  import {tabId} from 'utils/tab'

  const currentWindow = remote.getCurrentWindow()
  const config = currentWindow.$config

  // Update this stylesheet to match user prefs in the watch-object
  const customStyleElement = document.createElement('style')
  customStyleElement.id = 'customStyle'
  document.head.appendChild(customStyleElement)

  export default {
    computed: {
      editor() {
        return this.currentTab && this.currentTab.editor
      },
      writingModeClassName() {
        return this.currentTab ?
          `writing-mode-${this.currentTab.writingMode}` :
          'writing-mode-default'
      },
      tabs() {
        return this.$store.state.editor.tabs
      },
      currentTabIndex() {
        return this.$store.state.editor.currentTabIndex
      },
      currentTab() {
        return this.tabs[this.currentTabIndex]
      },
      settings() {
        return this.$store.state.app.settings
      },
      customStyle() {
        return `.markdown-body code,.markdown-body pre {
          font-family: ${this.settings.preview.codeFont === 'inherit' ? this.settings.preview.font : this.settings.preview.codeFont};
        }`
      }
    },
    data() {
      return {
        resizing: false,
        shouldCheckContentSaved: true,
        shouldListenFileWatcher: true
      }
    },
    created() {
      document.title = 'untitled - EME'
      customStyleElement.innerHTML = this.customStyle
    },
    mounted() {
      this.createNewTab()

      this.listenIpc()
      this.handleDrag()
    },
    watch: {
      'settings.preview.codeFont'() {
        customStyleElement.innerHTML = this.customStyle
      }
    },
    methods: {
      getSplitWidth(area) {
        if (!this.currentTab) {
          return '50%'
        }
        if (this.currentTab.writingMode !== 'default') {
          return '100%'
        }
        if (area === 'editor') {
          return this.currentTab.split + '%'
        }
        if (area === 'preview') {
          return (100 - this.currentTab.split) + '%'
        }
      },
      restoreAppState(state) {
        if (state.tabs.length > 0) {
          const startTabsCount = this.tabs.length
          state.tabs.forEach(tab => {
            this.createNewTab(tab, () => this.$store.commit('SET_CURRENT_TAB', startTabsCount + state.currentTabIndex))
          })
        }
      },
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
        this.$store.commit('UPDATE_FILE_PATH', {
          index,
          filePath
        })
        this.shouldListenFileWatcher = false
        await fs.writeFile(filePath, tab.content, 'utf8')
        this.shouldListenFileWatcher = true
        console.log(`saved as ${filePath}`)
        this.updateSaved({index, saved: true})
      },
      async handleSave(index) {
        try {
          const tab = this.tabs[index]
          const filePath = tab.filePath || await dialog.showSaveDialog(currentWindow, {
            filters: [
              {name: 'Markdown', extensions: ['md', 'markdown']}
            ]
          })
          if (filePath) {
            await this.save({index, filePath})
            this.createOrUpdateGist().catch(handleError)
            ipcRenderer.send('add-recent-file', filePath)
            return true
          }
        } catch (err) {
          handleError(err)
        }
      },
      async handleSaveAs(index) {
        const tab = this.tabs[index]
        const filePath = await dialog.showSaveDialog(currentWindow, {
          filters: [
            {name: 'Markdown', extensions: ['md', 'markdown']}
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
          this.$store.commit('UPDATE_RENAME_STATUS', {
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
      async handleRenamed(index, name) {
        const tab = this.tabs[index]

        const newPath = path.join(path.dirname(tab.filePath), name)

        this.$store.commit('UPDATE_RENAME_STATUS', {
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
          // store old filename to delete in gist at the end
          let oldFilePath = tab.filePath
          await fs.rename(tab.filePath, newPath)
          this.$store.commit('UPDATE_FILE_PATH', {
            index,
            filePath: newPath
          })
          console.log(`renamed as ... ${newPath}`)
          // update file watcher
          if (tab.watcher) {
            tab.watcher.close()
            tab.watcher = this.watchFile(newPath, index)
          }
          // remove old file in recent file history
          // add new file to histoy
          ipcRenderer.send('add-recent-file', newPath)
          ipcRenderer.send('remove-recent-file', oldFilePath)
          // update the renamed file in gist
          // delete the old file in gist at the same time
          // this.createOrUpdate here equals to delete
          // just pass null as relevant file's value
          this.createOrUpdateGist(oldFilePath)
          oldFilePath = null
        }
      },
      async overrideTab(filePath) {
        this.shouldCheckContentSaved = false
        const index = this.currentTabIndex
        const content = await fs.readFile(filePath, 'utf8')
        this.editor.getDoc().setValue(content)
        const watcher = this.watchFile(filePath, index)
        this.$store.commit('UPDATE_CONTENT_WITH_FILEPATH', {
          index,
          content,
          filePath,
          gist: config.get('gists')[filePath] || '',
          watcher
        })
        this.updateSaved({
          index,
          saved: true
        })
        this.shouldCheckContentSaved = true
      },
      watchFile(filePath, index) {
        if (filePath) {
          return nfs.watch(filePath, {persistent: false}, eventType => {
            if (eventType === 'change') {
              if (this.shouldListenFileWatcher) {
                this.reloadTab(index)
              }
            }
          })
        }
        return null
      },
      async createNewTab(tab = {}, created = () => {}) {
        let content = ''
        let gist = ''
        let watcher = null
        const index = this.tabs.length
        const filePath = tab.filePath || ''
        if (filePath) {
          content = await fs.readFile(filePath, 'utf8')
          gist = config.get('gists')[filePath] || ''
          watcher = this.watchFile(filePath, index)
        }
        const tabDefaults = {
          content,
          id: tabId.create(),
          saved: true,
          editor: null,
          isFocusMode: false,
          writingMode: this.settings.writingMode,
          isVimMode: false,
          pdf: '',
          exporting: false,
          rename: false,
          split: this.settings.writingMode === 'default' ? 50 : 100,
          gist,
          watcher
        }
        this.$store.commit('INIT_NEW_TAB', {
          ...tabDefaults,
          ...tab,
          filePath
        })
        setTimeout(() => {
          const tabEl = $(`.tab-body-${index}`)
          const textarea = tabEl.querySelector(`#editor-${index}`)
          const editor = CodeMirror.fromTextArea(textarea, {
            mode: 'gfm',
            theme: this.settings.editor.theme,
            lineNumbers: false,
            matchBrackets: true,
            lineWrapping: true,
            scrollbarStyle: 'simple',
            autofocus: true,
            dragDrop: false,
            tabSize: this.settings.editor.tabSize,
            indentWithTabs: this.settings.editor.indentWithTabs,
            extraKeys: {
              Enter: 'newlineAndIndentContinueMarkdownList',
              Tab: cm => {
                if (this.settings.indentWithTabs) {
                  cm.replaceSelection('\t')
                } else {
                  cm.replaceSelection(' '.repeat(cm.getOption('tabSize')))
                }
              },
              'Alt-F': 'findPersistent'
            }
          })

          setTimeout(() => {
            editor.refresh()
            editor.focus()
          }, 0)

          editor.on('change', e => {
            if (!this.shouldCheckContentSaved) return
            const content = e.getValue()
            console.log(`Tab ${index} changed. New length ${content.length}`)
            setTimeout(() => {
              this.updateSaved({
                index: this.currentTabIndex,
                saved: false
              })
              this.$store.commit('UPDATE_CONTENT', {
                index: this.currentTabIndex,
                content
              })
              this.handleScroll()
            })
          })

          this.$store.commit('SET_EDITOR', {index, editor})

          tabEl.querySelector('.CodeMirror-scroll').addEventListener('scroll', this.handleScroll)
          created()
        }, 0)
      },
      async handleOpen(filePath) {
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
          openFile(filePath)
        } else {
          const files = await dialog.showOpenDialog(currentWindow, {
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
          this.handleOpen(filePath).catch(handleError)
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
          this.$store.commit('TOGGLE_FOCUS_MODE')
        })

        ipcRenderer.on('toggle-vim-mode', () => {
          if (this.currentTab.isVimMode) {
            this.editor.setOption('keyMap', 'default')
          } else {
            this.editor.setOption('keyMap', 'vim')
          }
          this.$store.commit('TOGGLE_VIM_MODE')
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
          this.createNewTab({filePath}).catch(handleError)
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
        ipcRenderer.on('toggle-night-mode', () => {
          this.$store.commit('TOGGLE_NIGHT_MODE')

          this.updateEditorOptions({
            theme: this.settings.editor.theme
          })

          config.set('settings.theme', this.settings.theme)
          config.set('settings.preview.highlight', this.settings.preview.highlight)
          config.set('settings.editor.theme', this.settings.editor.theme)
        })

        window.onbeforeunload = e => {
          if (currentWindow.$state.unsaved !== 0) {
            e.returnValue = false
          }
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

        ipcRenderer.on('show-save-pdf-dialog', async () => {
          const filePath = await dialog.showSaveDialog(currentWindow, {
            filters: [
              {name: 'PDF', extensions: ['pdf']}
            ]
          })

          if (filePath) {
            this.$store.commit('START_EXPORTING', {
              index: this.currentTabIndex
            })
            const html = makeHTML({
              html: this.currentTab.html,
              css: [
                appPath('vendor/github-markdown-css/github-markdown.css'),
                appPath('vendor/katex/katex.min.css'),
                appPath('vendor/css/print.css')
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
            this.$store.commit('FINISH_EXPORTING_PDF', {
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

        ipcRenderer.on('publish-to-github-gist', () => {
          this.createOrUpdateGist()
        })

        event.on('new-tab', callback => {
          this.createNewTab({}, callback)
        })

        event.on('close-tab', index => {
          this.closeTab(index)
        })

        event.on('file-rename', (index, name) => {
          this.handleRenamed(index, name)
        })

        event.on('focus-current-tab', () => {
          this.editor.refresh()
          this.editor.focus()
        })

        event.on('update-editor-options', options => {
          this.updateEditorOptions(options)
        })
      },
      updateEditorOptions(options) {
        for (const option in options) {
          this.editor.setOption(option, options[option])
        }
        this.editor.refresh()
      },
      async reloadTab(index) {
        const tab = this.tabs[index]
        if (tab) {
          let reload = tab.saved
          if (!reload) {
            const filename = path.basename(tab.filePath)
            const clickedButton = await dialog.showMessageBox(currentWindow, {
              type: 'question',
              title: 'EME',
              message: `The ${filename} has been modyfied.`,
              detail: 'Your changes will be lost if you reload the file.',
              buttons: ['Reload', 'Don\'t Reload']
            })
            reload = clickedButton === 0
          }
          if (reload) {
            console.log('RELOAD')
            this.shouldCheckContentSaved = false
            this.shouldListenFileWatcher = false
            const content = await fs.readFile(tab.filePath, 'utf8')
            tab.editor.getDoc().setValue(content)
            this.$store.commit('UPDATE_CONTENT', {
              index,
              content
            })
            this.updateSaved({
              index,
              saved: true
            })
            this.shouldListenFileWatcher = true
            this.shouldCheckContentSaved = true
          }
        }
      },
      async closeTab(index) {
        const tab = this.tabs[index]
        if (tab && !tab.saved) {
          const filename = tab.filePath ? path.basename(tab.filePath) : 'untitled'
          const clickedButton = await dialog.showMessageBox(currentWindow, {
            type: 'question',
            title: 'EME',
            message: `Do you want to save the changes you made to ${filename} ?`,
            detail: 'Your changes will be lost if you don\'t save them.',
            buttons: ['Save', 'Cancel', 'Don\'t Save']
          })
          if (clickedButton === 0) {
            const saved = await this.handleSave(index)
            if (saved) {
              this.$store.commit('CLOSE_TAB', index)
              return {saved: true}
            }
          } else if (clickedButton === 2) {
            this.$store.commit('UPDATE_SAVE_STATUS', {index, saved: true})
            this.$store.commit('CLOSE_TAB', index)
            return {saved: false}
          }
          return false
        }
        if (tab) {
          this.$store.commit('CLOSE_TAB', index)
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
          let loadingChain = Promise.resolve()
          for (const f of e.dataTransfer.files) {
            loadingChain = loadingChain.then(() => this.createNewTab({filePath: f.path}))
          }
          loadingChain.catch(handleError)
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
          this.$store.commit('UPDATE_EDITOR_SPLIT', {
            index,
            split: this.startSplit + (dx / totalWidth * 100)
          })
        }
      },
      resizeEnd() {
        if (this.resizing) {
          this.resizing = false
          this.editor.refresh()
          this.editor.focus()
        }
      },
      async createOrUpdateGist(oldFilePath) {
        if (!this.currentTab.filePath) {
          handleError({
            message: 'You should save the file before publish it to GitHub Gist!'
          })
          return
        }
        if (!this.currentTab.content) {
          console.log('Gist is not published due to empty content!')
          return
        }
        if (!this.settings.autoSaveGist || !this.settings.tokens.github) {
          console.log('Auto-save GitHub Gist is disabled!')
          return
        }
        const filename = path.basename(this.currentTab.filePath)
        const files = {
          [filename]: {
            content: this.currentTab.content
          }
        }
        // in case a rename action triggers saving file
        // we should delete the file before rename in gist
        if (oldFilePath) {
          files[path.basename(oldFilePath)] = null
        }
        try {
          const payload = {files}
          const res = await createOrUpdateGist(payload, this.currentTab.gist)
          const data = await res.json()
          this.updateFileGist(data.id)
          this.filePathBeforeRename = []
        } catch (err) {
          console.log(err.stack)
          const res = await err.data.json()
          handleError({message: res.message})
        }
      },
      updateSaved(payload) {
        this.$store.commit('UPDATE_SAVE_STATUS', payload)
      },
      updateFileGist(gistId) {
        this.$store.commit('UPDATE_FILE_GIST', gistId)
        const filePath = this.currentTab.filePath
        config.set('gists', {
          ...config.get('gists'),
          [filePath]: gistId
        })
      }
    },
    components: {
      tip
    }
  }
</script>
