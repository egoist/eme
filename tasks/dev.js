#!/usr/bin/env node
'use strict'
const child = require('child_process')

process.env.NODE_ENV = 'development'
const port = 8020
let bundled = false

const webpack = child.spawn('npm', ['run', 'dev-server'])

webpack.stdout.on('data', (data) => {
  console.log(`[webpack] stdout: ${data}`)
  if (!bundled && data.indexOf('webpack: bundle is now VALID') !== -1) {
    bundled = true
    runElectron()
  }
})

webpack.stderr.on('data', (data) => {
  console.log(`[webpack] stderr: ${data}`)
})

webpack.on('close', (code) => {
  console.log(`[webpack] child process exited with code ${code}`)
})

function runElectron() {
  const electron = child.spawn('npm', ['run', 'app'])

  electron.stdout.on('data', (data) => {
    console.log(`[electron] stdout: ${data}`)
  })

  electron.stderr.on('data', (data) => {
    console.log(`[electron] stderr: ${data}`)
  })

  electron.on('close', (code) => {
    console.log(`[electron] child process exited with code ${code}`)
  })
}
