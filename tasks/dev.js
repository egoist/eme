#!/usr/bin/env node
'use strict'
const scripy = require('scripy')

process.env.NODE_ENV = 'development'
const port = 8020
let bundled = false

const webpack = scripy('npm run dev-server', {displayName: 'webpack'})

webpack.stdout.on('data', (data) => {
  if (!bundled && data.indexOf('webpack: bundle is now VALID') !== -1) {
    bundled = true
    scripy('npm run app', {displayName: 'electron'})
  }
})
