import {remote} from 'electron'

export default err => {
  remote.dialog.showErrorBox(err.name || 'Error', err.message)
}
