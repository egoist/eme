#!/usr/bin/env node
'use strict'
const scripy = require('scripy')

process.env.NODE_ENV = 'development'
let bundled = false

const webpack = scripy('npm run watch', {displayName: 'webpack'})

webpack.stdout.on('data', (data) => {
  if (!bundled && data.indexOf('bundle.js') !== -1) {
    bundled = true
    scripy('npm run app', {displayName: 'electron'})
  }
})
