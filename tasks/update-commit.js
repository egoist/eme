const Pkg = require('update-pkg')
const getLatestCommit = require('repo-latest-commit')

const pkg = new Pkg('./app')
const latestCommit = getLatestCommit()

pkg.set('commit', latestCommit[0])
pkg.saveSync()
