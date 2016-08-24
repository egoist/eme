import {isMac} from './os'

const metaKey = isMac ? 'Command' : 'Ctrl'

export default [
  `Use <kbd>${metaKey} \\</kbd> to toggle focus mode`,
  `You can drag and drop a file in the editor`,
  `Double click the header to create new tab`,
  `Use <kbd>${metaKey} Shift \\</kbd> to toggle writing mode`,
  `Try distraction free mode <kbd>${metaKey} J</kbd> when you enter full screen`
]
