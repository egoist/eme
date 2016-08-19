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
const windowStateKeeper = require('electron-window-state')
const buildMenu = require('./eme/menu')
const emeWindow = require('./eme/window')
const config = require('./eme/config')
const {parseShellCommand} = require('./eme/shell')

const appMenu = buildMenu({
  createWindow: emeWindow.createWindow
})

const createMainWindow = () => {
  const windowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600
  })
  const win = emeWindow.createWindow({windowState})
  windowState.manage(win)
  return win
}

let mainWindow // eslint-disable-line
app.on('ready', () => {
  const args = parseShellCommand()
  Menu.setApplicationMenu(appMenu)
  mainWindow = createMainWindow()

  if (args) {
    const {pathsToOpen, resourcePath} = args
    console.log(args)
    if (pathsToOpen) {
      const pathToOpen = pathsToOpen[0]
      const locationToOpen = `${resourcePath}/${pathToOpen}`
      console.log(locationToOpen)
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('open-file', locationToOpen)
      })
    } else {
      // open dirctory
      // mainWindow.send('open-dirctory', resourcePath)
    }
  }

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
    mainWindow = createMainWindow()
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

ipcMain.on('add-recent-file', (e, filePath) => {
  const files = config.get('recentFiles')
  const existing = files.indexOf(filePath)
  if (existing === -1) {
    // add to the head
    files.unshift(filePath)
    if (files.length > 10) {
      files.pop()
    }
  } else {
    // remove the existing one
    // add to the head
    files.splice(existing, 1)
    files.unshift(filePath)
  }

  config.set('recentFiles', files)
    Menu.setApplicationMenu(buildMenu({
      createWindow: emeWindow.createWindow
    }))
})
