import {platform} from './os'

export const cmdOrCtrl = platform === 'darwin' ? 'command' : 'ctrl'

