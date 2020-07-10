import {remote} from 'electron'

export default (() => {
  const dialog = {}
  Object.keys(remote.dialog).forEach(method => {
    dialog[method] = (...args) => {
      const result = remote.dialog[method](...args)
      return result
    }
  })
  return dialog
})()
