'use strict'
const {
  MenuItem,
  shell
} = require('electron')

module.exports = {
  append(params) {
    const text = params.selectionText
    return [
      new MenuItem({
        type: 'separator'
      }),
      new MenuItem({
        label: 'Search in Google',
        enabled: Boolean(text),
        click() {
          if (text) {
            shell.openExternal(`https://www.google.com/search?q=${text}`)
          }
        }
      })
    ]
  }
}
