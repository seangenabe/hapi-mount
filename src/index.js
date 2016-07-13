const pkg = require('../package')
const Path = require('path')
const req = require('require-glob-array')
const Hoek = require('hoek')

const HTTP_VERBS = new Set([
  'get', 'post', 'put', 'delete', 'trace', 'options', 'connect', 'patch'
])

module.exports = async function hapiMount(server, options, next) {
  try {
    options = options || {}
    let cwd = options.cwd || process.cwd()

    let [ext, methods, routes] = await Promise.all([
      getModules(cwd, options.ext || 'ext'),
      getModules(cwd, options.methods || 'methods'),
      getModules(
        cwd,
        options.routes || 'routes',
        '**/{get,post,put,delete,trace,options,connect,patch}.js'
      )
    ])

    ext = ext.map(([path, mod]) => {
      mod = [].concat(mod)
      return [path, mod]
    })

    methods = methods.map(([path, mod]) => {
      mod = [].concat(mod)
      return [path, mod]
    })

    // Auto-routes
    routes = routes.map(([path, mod]) => {
      mod = [].concat(mod).map(route => {
        if (typeof route !== 'object') { return route }

        if (!route.method) {
          route.method = Path.basename(path, '.js').toUpperCase()
        }
        if (!route.path) {
          route.path = `/${Path.dirname(path)}`
        }
        return route
      })
      return [path, mod]
    })

    if (options.bind) { server.bind(options.bind) }

    server.ext(getAndFlattenModules(ext))
    server.method(getAndFlattenModules(methods))
    server.route(getAndFlattenModules(routes))

    next()
  }
  catch (err) {
    next(err)
  }
}

function getAndFlattenModules(items) {
  return Hoek.flatten(items.map(([, m]) => m))
}

async function getModules(cwd, childpath, patterns) {
  let path = Path.join(cwd, childpath)
  let opts = { cwd: path, returnPath: true }
  let modules
  if (patterns) {
    modules = await req.async(patterns, opts)
  }
  else {
    modules = await req.async(opts)
  }
  modules = modules.filter(([, mod]) => {
    return !(
      mod == null ||
      isPlainObject(mod) &&
      Object.keys(mod).length === 0
    )
  })
  return modules
}

module.exports.attributes = {
  name: pkg.name,
  version: pkg.version
}

function isPlainObject(obj) {
  return obj.constructor === Object
}
