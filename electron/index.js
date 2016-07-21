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

  mainWindow.loadURL(
    isDev ?
    `file://${__dirname}/index.html` :
    `file://${__dirname}/index.prod.html`
  )



  mainWindow.on('closed', () => {
    mainWindow = null
  })
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
