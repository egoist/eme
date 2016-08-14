'use strict'
const fs = require('fs')
const os = require('os')
const path = require('path')
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

// TODO: refactor
ipcMain.on('print-to-pdf', (e, html, saveTo) => {
  let tempWin = new BrowserWindow({show: false})
  const tempPath = path.join(os.tmpdir(),  `eme-export-pdf.${Date.now()}.html`)
  fs.writeFileSync(tempPath, html, 'utf8')
  tempWin.loadURL(`file://${tempPath}`)
  const page = tempWin.webContents
  page.on('did-finish-load', () => {
    page.printToPDF({
      pageSize: 'A4'
    }, (err, pdfData) => {
      if (err) {
        return console.log(err)
      }
      fs.writeFile(saveTo, pdfData, err => {
        tempWin.destroy()
        tempWin = undefined
        mainWindow.webContents.send('finish-exporting-pdf', err, saveTo)
      })
    })
  })
})
