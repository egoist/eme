'use strict'
const path = require('path')
const {
  Menu,
  shell,
  app,
  dialog
} = require('electron')
const tildify = require('tildify')
const axios = require('axios')
const compare = require('semver-compare')
const config = require('./config')
const {installShell} = process.platform === 'win32' ? require('./win-shell') : require('./shell')

const version = app.getVersion()
const checkForUpdates = {
  label: 'Check for Updates',
  click(item, focusedWindow) {
    axios.get('https://api.github.com/repos/egoist/eme/releases/latest')
      .then(res => {
        const latestVersion = res.data.tag_name.substr(1)
        const hasUpdates = compare(latestVersion, version) === 1
        if (hasUpdates) {
          const answer = dialog.showMessageBox(focusedWindow, {
            type: 'question',
            message: 'Update',
            detail: `A newer version ${latestVersion} is available, are you willing to download the updates?`,
            buttons: ['OK', 'Cancel']
          })
          if (answer === 0) {
            shell.openExternal(`https://github.com/egoist/eme/releases/tag/v${latestVersion}`)
          }
        } else {
          dialog.showMessageBox(focusedWindow, {
            type: 'info',
            message: 'No Updates',
            detail: `Current version ${version} is already up to date!`,
            buttons: ['OK']
          })
        }
      })
      .catch(err => {
        dialog.showErrorBox('Update', `${err.name}: ${err.message}`)
      })
  }
}
const about = {
  label: 'About',
  click(item, focusedWindow) {
    dialog.showMessageBox(focusedWindow, {
      message: 'EME',
      type: 'info',
      buttons: ['OK'],
      detail: [
        'Elegant Markdown Editor',
        '',
        `EME: ${version}`,
        `Node.js: ${process.version.substr(1)}`,
        `Electron: ${process.versions.electron}`,
        `Chrome: ${process.versions.chrome}`
      ].join('\n')
    })
  }
}

module.exports = cb => {
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
          label: 'Open Last Session',
          accelerator: 'CmdOrCtrl+L',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('open-last-session')
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
          label: 'Install Shell Command',
          click() {
            installShell()
          }
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
          label: 'Rename',
          accelerator: 'CmdOrCtrl+Shift+R',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('file-rename')
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
          label: 'Toggle Distraction Free mode',
          accelerator: 'CmdOrCtrl+J',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('toggle-distraction-free-mode')
          }
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
          label: 'Toggle Presentation Mode',
          accelerator: 'CmdOrCtrl+K',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('toggle-presentation-mode')
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
        checkForUpdates,
        {
          type: 'separator'
        },
        {
          label: 'Install Shell Command',
          click() {
            installShell()
          }
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
  } else {
    template[template.length - 1].submenu.push(
      {
        type: 'separator'
      },
      checkForUpdates,
      about
    )
  }

  return Menu.buildFromTemplate(template)
}
