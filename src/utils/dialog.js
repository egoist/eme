import {remote} from 'electron'

export default (function (...args) {
  const dialog = {}
  Object.keys(remote.dialog).forEach(method => {
    dialog[method] = (...args) => {
      return new Promise(resolve => {
        remote.dialog[method](...args, resolve)
      })
    }
  })
  return dialog
})()
