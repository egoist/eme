const {BrowserWindow, Menu, app, dialog, ipcMain, shell} = require ('electron')
const Window = require('./window')
const buildMenu = require('./menu')

const isDev = process.env.NODE_ENV === 'development'

module.exports =
class EmeApplication {
  constructor(options){
    const { pathsToOpen, resourcePath } = options
    if( pathsToOpen && pathsToOpen.length > 0 ){
      this.openWithOption(options)
    } else {
      this.win = new Window({})
    }
    this.handleEvents()
    this.setupContextMenu()
  }

  handleEvents(){
    if (isDev) {
      const installExtension = require('electron-devtools-installer')
      installExtension.default(installExtension.VUEJS_DEVTOOLS)
        .then(name => console.log(`Added Extension:  ${name}`))
        .catch(err => console.log('An error occurred: ', err))
    }
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
    app.on('activate', () => {
      if (!this.win) {
        this.win = new Window()
      }
    })
    ipcMain.on('close-focus-window', () => {
      BrowserWindow.getFocusedWindow().close()
    })

  }

  openWithOption({pathsToOpen,resourcePath}){
    if(pathsToOpen.length > 0){
      this.openPaths({pathsToOpen,resourcePath})
    } else {
      this.openPath({pathsToOpen,resourcePath})
    }
  }

  setupContextMenu(){
    let win = this.win
    const appMenu = buildMenu({
      win
    })
    Menu.setApplicationMenu(appMenu)
  }

  openPath({pathsToOpen}){
    this.openPaths({pathsToOpen})
  }
  openPaths({pathsToOpen,resourcePath}){
    if(!pathsToOpen || pathsToOpen.length === 0)
      return

    this.win = new Window({pathsToOpen,resourcePath})
  }
}
