'use strict'
const path = require('path')
const fs = require('fs')
const {
  app,
  BrowserWindow
} = require('electron')

function checkFileExists(filePath){
  try {
    fs.statSync(preloadPath)
  } catch (e) {
    fs.writeFile(filePath)
  } finally {
    return true
  }
}

let preloadPath = path.resolve(process.cwd(),'README.md')
let preloadFile = checkFileExists(preloadPath)


let mainWindow

const isDev = process.env.NODE_ENV === 'development'

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden-inset'
  })

  mainWindow.loadURL(
    isDev ?
    `file://${__dirname}/index.html` :
    `file://${__dirname}/index.prod.html`
  )



  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform == 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
