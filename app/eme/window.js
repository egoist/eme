'use strict'
const path = require('path')
const electron = require('electron')
const {
  BrowserWindow,
  shell
} = electron
const config = require('./config')

const isDev = process.env.NODE_ENV === 'development'

class Window {
  constructor() {
    this.wins = 0
  }

  createWindow({
    homepage = `file://${path.join(__dirname, '../index.html')}`,
    windowState = {}
  } = {}) {
    const win = new BrowserWindow(Object.assign({
      name: 'EME',
      width: 800,
      height: 600,
      minWidth: 430,
      minHeight: 250,
      titleBarStyle: 'hidden-inset'
    }, windowState))

    const web = win.webContents

    win.loadURL(homepage)

    win.webContents.on('new-window', (e, url) => {
      e.preventDefault()
      shell.openExternal(url)
    })

    win.on('close', () => {
      web.send('close-window')
    })

    win.on('closed', () => {
      this.wins--
    })

    win.on('focus', () => {
      web.send('win-focus')
    })

    win.on('enter-full-screen', () => {
      web.send('enter-full-screen')
    })

    win.on('leave-full-screen', () => {
      web.send('leave-full-screen')
    })

    if (isDev) {
      const installExtension = require('electron-devtools-installer')
      installExtension.default(installExtension.VUEJS_DEVTOOLS)
        .then(name => console.log(`Added Extension:  ${name}`))
        .catch(err => console.log('An error occurred: ', err))
    }

    this.wins++
    win.$state = {
      unsaved: 0
    }
    win.$config = config

    return win
  }
}

module.exports = new Window()
