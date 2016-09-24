import {platform} from './os'

const metaKey = platform === 'darwin' ? 'Command' : 'Ctrl'

export default [
  `Use <kbd>${metaKey} \\</kbd> to toggle focus mode`,
  `You can drag and drop a file in the editor`,
  `Double click the header to create new tab`,
  `Use <kbd>${metaKey} Shift M</kbd> to switch writing mode`,
  `Try distraction free mode <kbd>${metaKey} J</kbd> when you enter full screen`,
  `Arrow keys are available in \`Preview Only\` mode to navigate between slides`,
  `At nights use <kbd>${metaKey} Shift N</kbd> to make your eyes feel better`
]
