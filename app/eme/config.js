'use strict'
const Config = require('electron-config')
const config = new Config({
  defaults: {
    recentFiles: [],
    lastAppState: {
      tabs: [],
      currentTabIndex: null
    }
  }
})

module.exports = config
