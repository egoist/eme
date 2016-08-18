// Configs, used in renderer process
'use strict'
const Config = require('electron-config')
const config = new Config({
  defaults: {
    lastAppState: null
  },
  name: 'app'
})

module.exports = config
