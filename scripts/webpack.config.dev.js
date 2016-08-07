'use strict'
const webpack = require('webpack')
const config = require('./webpack.config')

config.devtool = 'cheap-module-inline-source-map'
config.plugins = config.plugins.concat([
  new webpack.NoErrorsPlugin(),
  /*eslint-disable */
  new webpack.DefinePlugin({
    __DEV__: true,
    'process.env.NODE_ENV': JSON.stringify('development')
  })
])

module.exports = config
