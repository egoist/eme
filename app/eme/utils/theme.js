// Copyright 2020 @TwoCookingMice

'use strict'

const { nativeTheme } = require('electron')

function isSystemInNightMode() {
  return nativeTheme.shouldUseDarkColors
}

function changeTheme(win, themeControl, theme) {
  if (win) {
    win.webContents.send('change-theme', themeControl, theme)
  }
}

module.exports = { changeTheme, isSystemInNightMode }
