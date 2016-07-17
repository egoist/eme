#!/usr/bin/env node
'use strict'
const child = require('child_process')
const server = require('webpack-hot-server')
const config = require('../scripts/webpack.config')

process.env.NODE_ENV = 'development'
const port = 8020

server({
  config,
}).listen(port, () => {
  console.log(`Webpack Hot Server is running at http://lcoalhost:${port}`)
  const cmd = child.spawn('electron', ['electron/'])

  cmd.stdout.on('data', (data) => {
    console.log(`[electron] stdout: ${data}`)
  })

  cmd.stderr.on('data', (data) => {
    console.log(`[electron] stderr: ${data}`)
  })

  cmd.on('close', (code) => {
    console.log(`[electron] child process exited with code ${code}`)
  })
})
