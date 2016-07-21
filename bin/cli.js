#!/usr/bin/env node
const spawn = require('child_process').spawn
const path = require('path')
const electron = require('electron-prebuilt')
const serverPath = path.join(__dirname, '../electron/index.js')

const args = [ serverPath ].concat([].concat(process.argv).splice(2))

const proc = spawn(electron, args, {stdio: 'inherit'})
proc.on('close', (code) => {
  process.exit(code)
})
