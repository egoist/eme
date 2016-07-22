'use strict'
const path = require('path')
const {
  app,
  BrowserWindow,
  Menu
} = require('electron')

const appMenu = require('./menu')

let mainWindow

const isDev = process.env.NODE_ENV === 'development'

function createWindow () {
  mainWindow = new BrowserWindow({
    name: app.getName(),
    width: 800,
    height: 600,
    titleBarStyle: 'hidden-inset'
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (isDev) {
    const installExtension = require('electron-devtools-installer')
    installExtension.default(installExtension.VUEJS_DEVTOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err))
  }
}

app.on('ready', () => {
  Menu.setApplicationMenu(appMenu)
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
