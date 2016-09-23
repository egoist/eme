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
      font: `-apple-system, BlinkMacSystemFont,'avenir next', avenir,helvetica, 'helvetica neue',Ubuntu,'segoe ui', arial,sans-serif`,
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
        presentationMode: `${cmdOrCtrl}+k`
      }
    }
  }
})

module.exports = config
