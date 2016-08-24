'use strict'

const path = require('path')
const spawn = require('child_process').spawn
const yargs = require('yargs')
const {app} = require('electron')

class InstallShell {

  installShell() {
    const commandName = 'eme'
    const commandPath = path.join(this.getResourcesDirectory(), 'app', 'eme.sh')
    const destinationPath = path.join(this.getInstallDirectory(), commandName)
    this.createSymLink(commandPath, destinationPath)
  }

  getInstallDirectory() {
    return '/usr/local/bin'
  }

  getResourcesDirectory() {
    return process.resourcesPath
  }

  createSymLink(commandPath, destinationPath) {
    try {
      spawn('rm', ['-f', destinationPath])
      spawn('mkdir', ['-p', path.dirname(destinationPath)])
      spawn('ln', ['-s', commandPath, destinationPath])
    } catch (e) {
      console.log(e)
    }
  }
}

function writeFullVersion() {
  console.log(
    `
Atom    : ${app.getVersion()}
Electron: ${process.versions.electron}
Chrome  : ${process.versions.chrome}
Node    : ${process.versions.node}
    `
  )
}

function parseShellCommand() {
  const options = yargs(process.argv.slice(1))
    .usage(
      `
EME - Elegant Markdown Editor

Usage: eme [options] [path ...]
      `
    )
    .alias('h', 'help')
      .boolean('h')
      .describe('h', 'Print this usage message.')
    .alias('v', 'version')
      .boolean('v')
      .describe('v', 'Print the version information.')

  const argv = options.argv
  if (argv.version) {
    writeFullVersion()
    process.exit(0)
  }

  if (argv.help) {
    options.showHelp('log')
    process.exit(0)
  }

  const pathsToOpen = argv._
  const resourcePath = argv.executedFrom
  return {
    resourcePath, pathsToOpen
  }
}

module.exports = {
  InstallShell,
  parseShellCommand
}
