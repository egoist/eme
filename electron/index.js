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
const emeWindow = require('./eme/window')

const isDev = process.env.NODE_ENV === 'development'

const appMenu = buildMenu({
  createWindow: emeWindow.createWindow
})

let mainWindow
app.on('ready', () => {
  Menu.setApplicationMenu(appMenu)
  mainWindow = emeWindow.createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (emeWindow.wins === 0) {
    mainWindow = emeWindow.createWindow()
  }
})

ipcMain.on('close-focus-window', () => {
  BrowserWindow.getFocusedWindow().close()
})
