'use article'

const packager = require('electron-packager')
const pkg = require('../package.json')

const DEFAULT_OPTS = {
  dir: './electron',
}

const archs = ['ia32', 'x64']
const platforms = ['linux', 'win32', 'darwin']

platforms.forEach(plat => {
  archs.forEach(arch => {
    pack(plat, arch, log(plat, arch))
  })
})

function pack(plat, arch, cb) {

  if (plat === 'darwin' && arch === 'ia32') {
    return
  } else {
    if(DEFAULT_OPTS.icon){
      DEFAULT_OPTS.icon =  DEFAULT_OPTS.icon + (() => {
          let extension = '.png'
          if (plat === 'darwin') {
            extension = '.icns'
          } else if (plat === 'win32') {
            extension = '.ico'
          }
          return extension
        })()
    }

    const opts = Object.assign({}, DEFAULT_OPTS, {
      platform: plat,
      arch,
      prune: true,
      'app-version': pkg.version || DEFAULT_OPTS.version,
      out: `release/${plat}-${arch}`
    })

    packager(opts, cb)
  }


}

function log(plat, arch) {
  return (err, filepath) => {
    if (err) return console.error(err)
    console.log(`${plat}-${arch} finished!`)
  }
}
