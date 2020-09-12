// Copyright 2020 @The EME Authors

'use strict'
const buildMenu = require('./eme/menu')
const config = require('./eme/config')
const contextMenu = require('./eme/context-menu')
const emeWindow = require('./eme/window')
const event = require('./eme/event')
const fs = require('fs')
const os = require('os')
const path = require('path')
const pkg = require('./package.json')
const windowStateKeeper = require('electron-window-state')
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  nativeTheme
} = require('electron')
const { isDev } = require('./eme/utils')
const { changeTheme, isSystemInNightMode } = require('./eme/utils/theme')
const { parseShellCommand } = require('./eme/shell')

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

let locationToOpen = null // Cache locationToOpen when app is not ready.

app.on('ready', () => {
  const argv = parseShellCommand()
  Menu.setApplicationMenu(appMenu)
  mainWindow = createMainWindow()

  if (!isDev) {
    const {pathsToOpen, resourcePath} = argv
    const pathToOpen = pathsToOpen[0]

    if (pathsToOpen && resourcePath) {
      locationToOpen = path.resolve(resourcePath, pathToOpen)
    }

    // Open the file
    if (locationToOpen != null) {
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('open-file', locationToOpen)
        locationToOpen = null
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
  } else {
    mainWindow = null
  }
})

app.on('activate', (e, hasVisibleWindows) => {
  // If the application is not ready, then
  // just return and wait when the app is ready.
  if (!app.isReady()) {
    return
  }

  if (mainWindow == null) {
    mainWindow = createMainWindow()
    if (platform === 'darwin') {
      mainWindow.setSheetOffset(36)
    }
  }

  if (!hasVisibleWindows) {
    mainWindow.show()
  }

  // Open the file
  if (locationToOpen != null) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('open-file', locationToOpen)
      locationToOpen = null
    })
  }
})

app.on('open-file', (e, filePath) => {
  e.preventDefault()
  console.log(filePath)
  
  if (mainWindow == null) {
    locationToOpen = filePath
  } else {
    mainWindow.webContents.send('open-file', filePath)
  }
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

// Electron uses **nativeTheme** API to support native theme
// on MacOS and Windows. We register a listener here to adjust
// app's appearance when native theme of system changes.
nativeTheme.on('updated', () => {
  const themeControl = config.get('settings').themeControl
  if (themeControl === 'system') {
    const theme = isSystemInNightMode() ? 'dark' : 'light'
    if (mainWindow) {
      changeTheme(mainWindow, themeControl, theme)
    }
  }
})
