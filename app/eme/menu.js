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
const {InstallShell} = require('./shell')
const event = require('./event')
const _ = require('./utils')

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

  const settings = config.get('settings')
  const keys = settings.keys

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: keys.openNewTab,
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
          accelerator: keys.openFile,
          click(item, focusedWindow) {
            openFileInWindow(focusedWindow)
          }
        },
        {
          label: 'Open Last Session',
          accelerator: keys.openLastSession,
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('open-last-session')
          }
        },
        {
          label: 'Open Recent',
          submenu: recentFiles.concat([
            {
              type: 'separator'
            },
            {
              label: 'Clear all',
              click() {
                config.set('recentFiles', [])
                event.emit('reload-menu')
              }
            }
          ])
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
          visible: Boolean(_.isDev),
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
          label: 'Toggle Night Mode',
          accelerator: keys.toggleNightMode,
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('toggle-night-mode')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Toggle Distraction Free mode',
          accelerator: keys.distractionFreeMode,
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('toggle-distraction-free-mode')
          }
        },
        {
          label: 'Toggle Focus Mode',
          accelerator: keys.focusMode,
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('toggle-focus-mode')
          }
        },
        {
          label: 'Toggle Vim Mode',
          accelerator: keys.vimMode,
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('toggle-vim-mode')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Switch Writing Mode',
          accelerator: keys.switchWritingMode,
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.send('switch-writing-mode')
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
        },
        {
          label: 'Math Typesetting',
          click(item, focusedWindow) {
            const file = path.join(__dirname, '../math-typesetting.md')
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
            new InstallShell().installShell()
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
      {
        label: 'About',
        click() {
          cb.showAboutWindow()
        }
      }
    )
  }

  return Menu.buildFromTemplate(template)
}
