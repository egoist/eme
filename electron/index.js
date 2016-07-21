'use strict'
const path = require('path')
const fs = require('fs')
const {
  app,
  BrowserWindow,
} = require('electron')

function checkFileExists(filePath){
  try {
    fs.statSync(preloadPath)
    return true
  } catch (e) {
    // fs.writeFile(filePath)
    return false
  }
}

let preloadPath = path.resolve(process.cwd(),'README.md')
let preloadFile = checkFileExists(preloadPath, '')
if(preloadFile){
  let fileContent = fs.readFileSync(preloadPath,'utf-8')
  global.fileContent = fileContent
}


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
