'use strict'
const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const appPkg = require('../app/package')

module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: process.cwd() + '/app/dist',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.vue', '.css', '.json'],
    alias: {
      src: path.join(__dirname, '../src'),
      utils: path.join(__dirname, '../src/utils'),
      components: path.join(__dirname, '../src/components'),
      css: path.join(__dirname, '../src/css'),
      directives: path.join(__dirname, '../src/directives')
    }
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        exclude: [/node_modules/]
      },
      {
        test: /\.vue$/,
        loaders: ['vue']
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.json$/,
        loaders: ['json']
      },
      {
        test: /\.svg$/,
        loaders: ['svg-inline']
      }
    ]
  },
  babel: {
    presets: ['es2015', 'stage-1'],
    plugins: ['transform-runtime']
  },
  vue: {
    autoprefixer: false,
    postcss: [
      require('postcss-nested'),
      require('postcss-simple-vars'),
      require('postcss-import')(),
      require('postcss-mixins'),
      require('autoprefixer')({
        browsers: ['last 2 Chrome versions']
      })
    ],
    loaders: {
      css: ExtractTextPlugin.extract(
        'vue-style-loader',
        'css-loader?sourceMap'
      )
    }
  },
  target: 'electron',
  plugins: [
    new webpack.ExternalsPlugin('commonjs2', [
      './vendor/markdown-it-katex'
    ].concat(Object.keys(appPkg.dependencies))),
    new ExtractTextPlugin('style.css')
  ]
}
