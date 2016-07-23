'use strict'
const path = require('path')
const {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain
} = require('electron')
const buildMenu = require('./menu')

let windowCount = 0

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

  win.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    shell.openExternal(url)
  })

  win.on('closed', () => {
    windowCount--
  })

  win.on('focus', () => {
    win.webContents.send('win-focus')
  })

  if (isDev) {
    const installExtension = require('electron-devtools-installer')
    installExtension.default(installExtension.VUEJS_DEVTOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err))
  }

  windowCount++
  return win
}

const appMenu = buildMenu({
  createWindow
})

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
  if (windowCount === 0) {
    createWindow()
  }
})

ipcMain.on('close-focus-window', () => {
  BrowserWindow.getFocusedWindow().close()
})
