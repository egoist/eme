import path from 'path'
import {remote} from 'electron'

export function appPath(...args) {
  return path.join(remote.app.getAppPath(), ...args)
}
