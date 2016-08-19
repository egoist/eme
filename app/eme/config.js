'use strict'
const Config = require('electron-config')
const config = new Config({
  defaults: {
    recentFiles: [],
    lastAppState: null
  }
})

module.exports = config
