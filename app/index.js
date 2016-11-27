'use strict'
const fs = require('fs')
const os = require('os')
const path = require('path')
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog
} = require('electron')
const windowStateKeeper = require('electron-window-state')
const event = require('./eme/event')
const buildMenu = require('./eme/menu')
const emeWindow = require('./eme/window')
const config = require('./eme/config')
const {parseShellCommand} = require('./eme/shell')
const {
  isDev
} = require('./eme/utils')
const contextMenu = require('./eme/context-menu')
const pkg = require('./package.json')

require('electron-context-menu')(contextMenu)

const platform = os.platform()

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

const showAboutWindow = () => {
  dialog.showMessageBox({
    title: pkg.productName,
    message: pkg.productName,
    type: 'info',
    detail: [
      `Version ${app.getVersion()}`,
      `Shell ${process.versions.electron}`,
      `Renderer ${process.versions.chrome}`,
      `Node ${process.versions.node}`
    ].join('\n'),
    buttons: ['OK'],
    noLink: true
  }, () => null)
}

const menuOptions = {
  createWindow: emeWindow.createWindow,
  showAboutWindow
}

const appMenu = buildMenu(menuOptions)

const reloadMenu = () => {
  Menu.setApplicationMenu(buildMenu(menuOptions))
}

let mainWindow // eslint-disable-line
let pdfWindow // eslint-disable-line
app.on('ready', () => {
  const argv = parseShellCommand()
  Menu.setApplicationMenu(appMenu)
  mainWindow = createMainWindow()

  if (!isDev) {
    const {pathsToOpen, resourcePath} = argv
    const pathToOpen = pathsToOpen[0]
    if (pathToOpen && resourcePath) {
      const locationToOpen = path.resolve(resourcePath, pathToOpen)
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('open-file', locationToOpen)
      })
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
      pageSize: 'A4'
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
  reloadMenu()
})

ipcMain.on('remove-recent-file', (e, fileToRemove) => {
  config.set('recentFiles', config.get('recentFiles').filter(filePath => {
    return filePath !== fileToRemove
  }))
  reloadMenu()
})

ipcMain.on('log', (e, msg) => {
  console.log(JSON.stringify(msg, null, 2))
})

ipcMain.on('reload-menu', () => {
  reloadMenu()
})

event.on('reload-menu', () => {
  reloadMenu()
})
