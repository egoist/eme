'use strict'

const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn


class InstallShell {
  constructor(){
  }

  getInstallDirectory(){
    return '/usr/local/bin'
  }

  getResourcesDirectory(){
    return process.resourcesPath
  }

  installShellCommand(){
    const commandName = 'eme'
    const commandPath = path.join(this.getResourcesDirectory(),'app','eme.sh')
    const destinationPath = path.join(this.getInstallDirectory(), commandName)
    this.createSymLink (commandPath, destinationPath)
  }

  createSymLink(commandPath,destinationPath){
    try {
      spawn('rm', ['-f', destinationPath])
      spawn('mkdir', ['-p', path.dirname(destinationPath)])
      spawn('ln', ['-s', commandPath, destinationPath])
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = InstallShell
