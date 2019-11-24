// Tildify absolute paths

import * as path from 'path';
import * as os from 'os';

export default function (currentPath: string): string {
  const normalizedPath = path.normalize(currentPath) + path.sep;
  const homeDir = os.homedir();

  return (normalizedPath.indexOf(homeDir) === 0 ?
    normalizedPath.replace(homeDir + path.sep, `~${path.sep}`):
    normalizedPath.slice(0, -1));
}
