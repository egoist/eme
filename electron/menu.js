'use strict'
const {
  Menu,
  shell,
  app
} = require('electron')


const build = cb => {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: cb.createWindow
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('open-file')
            } else {
              const win = cb.createWindow()
              win.webContents.on('did-finish-load', () => {
                win.webContents.send('open-file')
              })
            }
          }
        },
        {
          label: 'Open In New Window',
          accelerator: 'CmdOrCtrl+Shift+O',
          click(item) {
            const win = cb.createWindow()
            win.webContents.on('did-finish-load', () => {
              win.webContents.send('open-file')
            })
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.webContents.send('file-save')
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+S+Shift',
          click(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.webContents.send('file-save-as')
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'pasteandmatchstyle'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        },
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.reload()
          }
        },
        {
          role: 'togglefullscreen'
        },
        {
          label: 'Toggle Focus Mode',
          accelerator: 'CmdOrCtrl+\\',
          click(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.webContents.send('toggle-focus-mode')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.webContents.toggleDevTools()
          }
        },
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.webContents.send('close-current-tab')
          }
        },
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Zoom',
          role: 'zoom'
        },
        {
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          role: 'front'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Report bugs',
          click() { shell.openExternal('http://github.com/egoist/eme/issues') }
        },
        {
          type: 'separator'
        },
        {
          label: 'Welcome Guide',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('open-file', __dirname + '/welcome-guide.md')
            } else {
              const win = cb.createWindow()
              win.webContents.on('did-finish-load', () => {
                win.webContents.send('open-file', __dirname + '/welcome-guide.md')
              })
            }
          }
        }
      ]
    },
  ]

  if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
      label: name,
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        },
      ]
    })
  }

  return Menu.buildFromTemplate(template)
}


module.exports = cb => build(cb)
