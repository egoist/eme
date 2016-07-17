'use strict'

const _ = module.exports = {}

_.app = () => {
  const args = [].slice.call(arguments)
  return path.join.apply(null, [__dirname, '../app'].concat(args))
}
