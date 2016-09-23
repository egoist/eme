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
    settings: {
      theme: 'white',
      colorSchema: 'base16-light',
      highlight: 'github',
      fontSize: 16,
      font: 'Menlo, "DejaVu Sans Mono", "Lucida Console", monos',
      writingMode: 'default',
      tabSize: 2,
      indentWithTabs: false,
      keys: {
        openNewTab: `${cmdOrCtrl}+t`,
        openFile: `${cmdOrCtrl}+o`,
        openLastSession: `${cmdOrCtrl}+l`,
        switchWritingMode: `${cmdOrCtrl}+shift+m`,
        distractionFreeMode: `${cmdOrCtrl}+j`,
        vimMode: `${cmdOrCtrl}+i`,
        focusMode: `${cmdOrCtrl}+\\`,
        presentationMode: `${cmdOrCtrl}+k`,
        toggleNightMode: `${cmdOrCtrl}+shift+n`
      }
    }
  }
})

module.exports = config
