/* eslint-disable quote-props */
'use strict'
const minimist = require('minimist')
const packager = require('electron-packager')
const scripy = require('scripy')
const $ = require('shelljs')
const pkg = require('../app/package.json')

const args = minimist(process.argv.slice(2))
const target = args._[0]

const platforms = {}
const defaults = {
  dir: './app',
  'app-version': pkg.version,
  out: 'dist',
  overwrite: true,
  prune: true
}

const cb = (err, paths) => {
  if (err) {
    console.log(err.message)
    process.exit(1)
  }
  if (paths) console.log(paths.join('\n'))
}

platforms.macos = () => {
  $.mkdir('-p', 'dist/installers')
  $.rm('-rf', 'dist/EME-darwin-x64')
  $.rm('-rf', 'dist/installers/*.dmg')

  packager(Object.assign({}, defaults, {
    platform: 'darwin',
    arch: 'x64',
    'app-bundle-id': 'com.egoistian.eme',
    icon: './build/icon.icns'
  }), (err, paths) => {
    cb(err, paths)
    scripy.sync(`appdmg ./tasks/appdmg.json ./dist/installers/EME-macos-${pkg.version}.dmg`, {
      stdio: 'inherit'
    })
  })
}

platforms.linux = () => {
  $.mkdir('-p', 'dist/installers')
  $.rm('-rf', 'dist/EME-linux-x64')
  $.rm('-rf', 'dist/installers/*.deb')

  packager(Object.assign({}, defaults, {
    platform: 'linux',
    arch: 'x64',
    'app-bundle-id': 'com.egoistian.eme'
  }), (err, paths) => {
    cb(err, paths)
    require('electron-installer-debian')({
      src: 'dist/EME-linux-x64',
      dest: 'dist/installers',
      arch: 'amd64',
      icon: 'app/resources/icon.png'
    }, err => {
      cb(err)
    })
  })
}

platforms.windows = () => {
  $.rm('-rf', 'dist/EME-win32-ia32')
  $.rm('-rf', 'dist/EME-windows-*.zip')

  packager(Object.assign({}, defaults, {
    platform: 'win32',
    arch: 'ia32',
    icon: './build/icon.ico',
    'version-string': {
      productName: pkg.productName
    }
  }), (err, paths) => {
    cb(err, paths)
    $.exec(`cd dist/EME-win32-ia32 && zip -ryXq9 ../EME-windows-${pkg.version}.zip *`)
  })
}

platforms.all = () => {
  platforms.macos()
  platforms.linux()
  platforms.windows()
}

platforms[target]()
