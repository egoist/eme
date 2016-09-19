'use strict'
const os = require('os')
const Config = require('electron-config')

const cmdOrCtrl = os.platform() === 'darwin' ? 'command' : 'ctrl'

const config = new Config({
  defaults: {
    recentFiles: [],
    lastAppState: {
      tabs: [],
      currentTabIndex: null
    },
    settings: {
      writingMode: 'default',
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
