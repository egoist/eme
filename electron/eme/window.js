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

    const options = {
      name: app.getName(),
      width: 800,
      height: 600,
      minWidth: 430,
      minHeight: 250,
      titleBarStyle: 'hidden-inset'
    }

    this.locationsToOpen = `${resourcePath}/${pathsToOpen}`
    this.win = new BrowserWindow(options)
    this.loaded = null
    this.handleEvents()

    this.win.loadURL(`file://${path.join(__dirname, '../index.html')}`)
    this.hasPathToOpen = !(this.locationsToOpen.length === 1 && ! this.locationsToOpen[0].pathsToOpen)
    this.openLocations(this.hasPathToOpen && this.locationsToOpen)
  }


  handleEvents(){
    this.win.webContents.on('did-finish-load', ()=> {
      this.loaded = true
    })
    this.win.on('new-window', (e, url) => {
      e.preventDefault()
      shell.openExternal(url)
    })
    this.win.on('close', e => {
      this.win.webContents.send('close-window')
    })
    this.win.on('focus', () => {
      this.win.webContents.send('win-focus')
    })
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
