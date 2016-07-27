'use strict'
const path = require('path')
const fs = require('fs')
const {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain
} = require('electron')
const buildMenu = require('./menu')

module.exports = class EmeWindow {
  constructor(settings={}){
    const { resourcePath, pathsToOpen } = settings
    this.locationsToOpen = `${resourcePath}/${pathsToOpen}`
    const options = {
      name: app.getName(),
      width: 800,
      height: 600,
      minWidth: 430,
      minHeight: 250,
      titleBarStyle: 'hidden-inset'
    }
    this.win = new BrowserWindow(options)
    this.loaded = null
    this.handleEvents()

    let loadSetting = Object.assign({}, settings)
    loadSetting.appVersion = app.getVersion()
    loadSetting.resourcePath = resourcePath
    loadSetting.initialPaths = fs.statSyncNoException(pathsToOpen) ? path.dirname(pathsToOpen) : pathsToOpen



    this.win.loadURL(`file://${__dirname}/index.html`)
    this.win.webContents.on('did-finish-load', ()=> {
      this.loaded = true
    })
    this.hasPathToOpen = !(this.locationsToOpen.length === 1 && ! this.locationsToOpen[0].pathsToOpen)
    this.openLocations(this.hasPathToOpen && this.locationsToOpen)
  }


  handleEvents(){
    this.setupContextMenu()

    this.win.on('new-window', (e, url) => {
      e.preventDefault()
      shell.openExternal(url)
    })
    this.win.on('closed', () => {
      this.windowCount--
    })
    this.win.on('focus', () => {
      this.win.webContents.send('win-focus')
    })
  }

  setupContextMenu(){
    let win = this.win
    const appMenu = buildMenu({
      win
    })
    Menu.setApplicationMenu(appMenu)
  }

  openLocations(locationsToOpen){
    if(this.loaded){
      this.win.webContents.send('open-file', locationsToOpen)
    }else {
      this.win.webContents.on('did-finish-load',()=> {
        this.openLocations(locationsToOpen)
      })
    }
  }
}
