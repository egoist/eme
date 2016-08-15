'use strict'
const path = require('path')
const {
  Menu,
  shell,
  app
} = require('electron')
const tildify = require('tildify')
const config = require('./config')

const build = cb => {
  const openFileInWindow = (win, file) => {
    if (win) {
      win.webContents.send('open-file', file)
    } else {
      win = cb.createWindow()
      win.webContents.on('did-finish-load', () => {
        win.webContents.send('open-file', file)
      })
    }
  }

  let recentFiles = config.get('recentFiles').map(file => ({
    label: tildify(file),
    file,
    click(item, focusedWindow) {
      openFileInWindow(focusedWindow, item.file)
    }
  }))
  if (recentFiles.length === 0) {
    recentFiles = [{
      label: '(empty)'
    }]
  }

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('new-tab')
            } else {
              cb.createWindow()
            }
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click(item, focusedWindow) {
            openFileInWindow(focusedWindow)
          }
        },
        {
          label: 'Open Recent',
          submenu: recentFiles
        },
        {
          type: 'separator'
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('file-save')
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+S+Shift',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('file-save-as')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Export as PDF',
          accelerator: 'CmdOrCtrl+Shift+P',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('show-save-pdf-dialog')
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
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload()
          }
        },
        {
          role: 'togglefullscreen'
        },
        {
          type: 'separator'
        },
        {
          label: 'Toggle Focus Mode',
          accelerator: 'CmdOrCtrl+\\',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('toggle-focus-mode')
          }
        },
        {
          label: 'Toggle Vim Mode',
          accelerator: 'CmdOrCtrl+I',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('toggle-vim-mode')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
          }
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('close-current-tab')
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
          click() {
            shell.openExternal('http://github.com/egoist/eme/issues')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Welcome Guide',
          click(item, focusedWindow) {
            const file = path.join(__dirname, '../welcome-guide.md')
            openFileInWindow(focusedWindow, file)
          }
        }
      ]
    }
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
          label: 'Quit',
          accelerator: 'Command+Q',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('close-and-exit')
            } else {
              app.exit(0)
            }
          }
        }
      ]
    })
  }

  return Menu.buildFromTemplate(template)
}

module.exports = cb => build(cb)
