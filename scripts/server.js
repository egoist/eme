'use strict'
const path = require('path')
const server = require('webpack-hot-server')
const config = require('./webpack.config.dev')

config.entry.push(
  'webpack-hot-middleware/client?path=http://localhost:8082/__webpack_hmr'
)

const app = server({
  config
})

app.listen(8082, () => {
  console.log(`http://localhost:8082`)
})
