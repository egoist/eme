import os from 'os'

const platform = os.platform()

export const isMac = platform === 'darwin'
