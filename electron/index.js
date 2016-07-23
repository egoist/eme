'use strict'
const path = require('path')
const {
  app,
  BrowserWindow,
  Menu,
  shell
} = require('electron')
const buildMenu = require('./menu')

let mainWindow

const isDev = process.env.NODE_ENV === 'development'

function createWindow () {
  let win = new BrowserWindow({
    name: app.getName(),
    width: 800,
    height: 600,
    minWidth: 430,
    minHeight: 250,
    titleBarStyle: 'hidden-inset'
  })

  win.loadURL(`file://${__dirname}/index.html`)

  win.on('closed', () => {
    win = null
  })

  win.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    shell.openExternal(url)
  })

  if (isDev) {
    const installExtension = require('electron-devtools-installer')
    installExtension.default(installExtension.VUEJS_DEVTOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err))
  }

  return win
}

const appMenu = buildMenu({
  createWindow
})

app.on('ready', () => {
  Menu.setApplicationMenu(appMenu)
  mainWindow = createWindow()
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
