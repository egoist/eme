'use strict'
const os = require('os')
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require('electron')
const buildMenu = require('./eme/menu')
const emeWindow = require('./eme/window')

const appMenu = buildMenu({
  createWindow: emeWindow.createWindow
})

let mainWindow // eslint-disable-line
app.on('ready', () => {
  Menu.setApplicationMenu(appMenu)
  mainWindow = emeWindow.createWindow()
  if (os.platform() === 'darwin') {
    mainWindow.setSheetOffset(36)
  }
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

app.on('open-file', (e, filePath) => {
  e.preventDefault()
  console.log(filePath)
})

ipcMain.on('close-focus-window', () => {
  BrowserWindow.getFocusedWindow().close()
})
