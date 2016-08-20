import {isMac} from './os'

const metaKey = isMac ? 'Command' : 'Ctrl'

export default [
  `Use <kbd>${metaKey} \\</kbd> to toggle focus mode`,
  `You can drag and drop a file in the editor`
]
