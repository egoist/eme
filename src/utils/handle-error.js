import {remote} from 'electron'

export default err => {
  remote.dialog.showMessageBox(remote.getCurrentWindow(), {
    message: err.name || 'Error',
    detail: err.message,
    buttons: ['OK']
  })
}
