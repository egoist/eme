const path = require('path')
const spawn = require('child_process').spawn

const appFolder = path.resolve(process.execPath, '..')
const binFolder = path.join(appFolder, 'resources', 'app', 'resources', 'bin')

let setxPath
let powershellPath
if (process.env.SystemRoot) {
  const system32Path = path.join(process.env.SystemRoot, 'System32')
  setxPath = path.join(system32Path, 'setx.exe')
  powershellPath = path.join(system32Path, 'WindowsPowerShell', 'v1.0', 'powershell.exe')
} else {
  setxPath = 'setx.exe'
  powershellPath = 'powershell.exe'
}

function installShell() {
  spawnPowerShell(['[environment]::GetEnvironmentVariable(\'Path\',\'User\')'])
}

function spawnPowerShell(args) {
  let stdout = ''
  let spawnedProcess
  args[0] = '[Console]::OutputEncoding=[System.Text.Encoding]::UTF8\n$output=" + args[0] + "\n[Console]::WriteLine($output)'
  args.unshift('-command')
  args.unshift('RemoteSigned')
  args.unshift('-ExecutionPolicy')
  args.unshift('-noprofile')
  try {
    spawnedProcess = spawn(powershellPath, args)
  } catch (e) {
  }

  spawnedProcess.stdout.on('data', data => {
    stdout = stdout + data + ';'
  })
  spawnedProcess.stdout.on('end', () => {
    if (stdout.indexOf(binFolder) === -1) {
      addBinToPath(stdout.replace(/^\s+|\s+$/g, '').split(/;+/).filter(x => x))
    }
  })
  spawnedProcess.stdin.end()
}

function spawnSetx(args) {
  spawn(setxPath, args)
}

function addBinToPath(pathSegments) {
  pathSegments.push(binFolder)
  const newPathEnv = pathSegments.join('; ')
  spawnSetx(['Path', newPathEnv])
}

module.exports = {
  installShell
}
