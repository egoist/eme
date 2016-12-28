import dialog from 'utils/dialog'
import {remote} from 'electron'

export default err => {
  return dialog.showMessageBox(remote.getCurrentWindow(), {
    message: err.name || 'Error',
    detail: err.message,
    buttons: ['OK']
  })
}
