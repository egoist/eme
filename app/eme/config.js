'use strict'
const os = require('os')
const Config = require('./utils/electron-config')

const cmdOrCtrl = os.platform() === 'darwin' ? 'command' : 'ctrl'

const config = new Config({
  defaults: {
    recentFiles: [],
    lastAppState: {
      tabs: [],
      currentTabIndex: null
    },
    gists: {},
    settings: {
      theme: 'white',
      writingMode: 'default',
      tokens: {
        github: ''
      },
      editor: {
        theme: 'base16-light',
        font: `"fira code", menlo, "lucida console"`,
        fontSize: 16,
        tabSize: 2,
        indentWithTabs: false
      },
      preview: {
        highlight: 'github',
        font: `"fira code", menlo, "lucida console"`,
        codeFont: 'inherit',
        fontSize: 16
      },
      autoSaveGist: false,
      keys: {
        openNewTab: `${cmdOrCtrl}+t`,
        openFile: `${cmdOrCtrl}+o`,
        openLastSession: `${cmdOrCtrl}+l`,
        switchWritingMode: `${cmdOrCtrl}+shift+m`,
        distractionFreeMode: `${cmdOrCtrl}+j`,
        vimMode: `${cmdOrCtrl}+i`,
        focusMode: `${cmdOrCtrl}+\\`,
        toggleNightMode: `${cmdOrCtrl}+shift+n`
      }
    }
  }
})

module.exports = config
