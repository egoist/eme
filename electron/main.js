const {app} = require('electron')
const fs = require('fs')
const path = require('path')
const yargs = require('yargs')

const dir = process.env.NODE_ENV === 'development' ? 'electron' : 'app'

function start(){
  const args = parseCommandLine()
  args.env = process.env

  addPathToOpen = (event,pathsToOpen) => {
    event.preventDefault()
    args.pathsToOpen.push(pathsToOpen)
  }

  app.on('open-file', addPathToOpen)
  app.on('ready',() => {

    EMEApplication = require(path.join(path.dirname(__dirname),dir,'eme','application'))
    const EME = new EMEApplication(args)
  })
}

function writeFullVersion(){
  return (
    process.stdout.write(
      `
      Atom    : ${app.getVersion()}
      Electron: ${process.versions.electron}
      Chrome  : ${process.versions.chrome}
      Node    : ${process.versions.node}
      `
    )
  )
}

function parseCommandLine(){
  const version = app.getVersion()
  const options = yargs(process.argv.slice(1))
  options.usage(
    `
    Eme Editor

    Usage: eme [options] [path ...]
    `
  )

  options.alias('h', 'help').boolean('h').describe('h', 'Print this usage message.')
  options.alias('v', 'version').boolean('v').describe('v', 'Print the version information.')

  const args = options.argv
  if(args.help){
    process.stdout.write(options.help())
    process.exit(0)
  }

  if(args.version){
    writeFullVersion()
    process.exit(0)
  }

  const pathsToOpen = args._
  const resourcePath = args.executedFrom
  return {
    resourcePath, pathsToOpen
  }
}

start()
