'use strict'

const pkg = require('./package')
const Path = require('path')
const req = require('require-glob-array')
const Hoek = require('hoek')

module.exports = function hapiMount(server, options, next) {
  try {
    options = options || {}
    let cwd = options.cwd || process.cwd()

    let ext = getModules(cwd, options.ext || 'ext')
    let methods = getModules(cwd, options.methods || 'methods')
    let routes = getModules(cwd, options.routes || 'routes', '**/*.js')

    server.ext(ext)
    server.method(methods)
    server.route(routes)

    next()
  }
  catch (err) {
    next(err)
  }
}

function getModules(cwd, childpath, patterns) {
  debugger
  let path = Path.join(cwd, childpath)
  let opts = { cwd: path }
  let objects
  if (patterns) {
    objects = req(patterns, opts)
  }
  else {
    objects = req(opts)
  }
  objects = Hoek.flatten(objects)
  return objects
}

module.exports.attributes = {
  name: pkg.name,
  version: pkg.version
}
