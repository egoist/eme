'use strict'
const Config = require('electron-config')
const config = new Config({
  defaults: {
    recentFiles: []
  }
})

module.exports = config
