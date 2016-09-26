var path  = require('path');
var spawn = require('child_process').spawn;

var emeCommandPath = path.resolve(__dirname, '..', '..', '..', '..','eme.exe');
var arguments = process.argv.slice(2);
arguments.unshift('--executed-from', process.cwd());
var options = {detached: true, stdio: 'ignore'};
spawn(emeCommandPath, arguments, options);
process.exit(0);
