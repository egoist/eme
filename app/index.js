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
const {
  isDev
} = require('./eme/utils')

const platform = os.platform()

const appMenu = buildMenu({
  createWindow: emeWindow.createWindow
})

const createMainWindow = () => {
  const windowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600
  })
  if (platform === 'linux') {
    windowState.icon = path.join(__dirname, 'resources/icon.png')
  }
  const win = emeWindow.createWindow({windowState})
  windowState.manage(win)
  return win
}

let mainWindow // eslint-disable-line
let pdfWindow // eslint-disable-line
app.on('ready', () => {
  const argv = parseShellCommand()
  Menu.setApplicationMenu(appMenu)
  mainWindow = createMainWindow()

  if (!isDev) {
    const {pathsToOpen, resourcePath} = argv
    if (pathsToOpen.length > 0) {
      if (pathsToOpen) {
        const pathToOpen = pathsToOpen[0]
        const locationToOpen = `${resourcePath}/${pathToOpen}`
        mainWindow.webContents.on('did-finish-load', () => {
          mainWindow.webContents.send('open-file', locationToOpen)
        })
      } else {
        // open dirctory
        // mainWindow.send('open-dirctory', resourcePath)
      }
    }
  }

  if (platform === 'darwin') {
    mainWindow.setSheetOffset(36)
  }
})

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (emeWindow.wins === 0) {
    mainWindow = createMainWindow()
    if (platform === 'darwin') {
      mainWindow.setSheetOffset(36)
    }
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
ipcMain.on('print-to-pdf', (e, html) => {
  pdfWindow = new BrowserWindow({show: false})
  const tempPath = path.join(os.tmpdir(), `eme-export-pdf.${Date.now()}.html`)
  fs.writeFileSync(tempPath, html, 'utf8')
  console.log(tempPath)
  pdfWindow.loadURL(`file://${tempPath}`)
})

ipcMain.on('pdf-window-ready', (e, options) => {
  const page = pdfWindow.webContents
  page.on('did-finish-load', () => {
    page.printToPDF({
      pageSize: options.isPresentation ? 'Tabloid' : 'A4',
      landscape: true
    }, (err, pdfData) => {
      if (err) {
        return console.log(err)
      }
      fs.writeFile(options.saveTo, pdfData, err => {
        pdfWindow.destroy()
        pdfWindow = undefined
        mainWindow.webContents.send('finish-exporting-pdf', err, options.saveTo)
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

ipcMain.on('log', (e, msg) => {
  console.log(JSON.stringify(msg, null, 2))
})
