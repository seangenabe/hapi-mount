const pkg = require('../package')
const Path = require('path')
const req = require('require-glob-array')
const Hoek = require('hoek')
const camelCase = require('lodash.camelcase')

const HTTP_VERBS = new Set([
  'get', 'post', 'put', 'delete', 'trace', 'options', 'connect', 'patch'
])
const HAPI_EXT_POINTS = new Set([
  'onRequest',
  'onPreAuth',
  'onPostAuth',
  'onPreHandler',
  'onPostHandler',
  'onPreResponse',
  'onPreStart',
  'onPostStart',
  'onPreStop',
  'onPostStop'
])

module.exports = function hapiMount(
  server,
  {
    cwd = '.',
    ext = 'ext',
    methods = 'methods',
    routes = 'routes',
    bind,
    bindToRoot
  }, next) {
  // Guard against returning a Promise, for forward-compatibility.
  (async () => {
    try {
      let [extArray, methodsArray, routesArray] = await Promise.all([
        getModules(cwd, ext),
        getModules(cwd, methods),
        getModules(cwd, routes,
          '**/{get,post,put,delete,trace,options,connect,patch}.js')
      ])

      // Auto ext
      extArray = entityDefaults(extArray, {
        funcKey: 'method',
        validBasenames: HAPI_EXT_POINTS,
        basenameKey: 'type'
      })

      // Auto methods
      methodsArray = entityDefaults(methodsArray, {
        funcKey: 'method',
        basenameKey: 'name',
        postFunc(methodDefinition) {
          methodDefinition.options = { callback: false }
        }
      })

      // Auto routes
      routesArray = entityDefaults(routesArray, {
        funcKey: 'handler',
        validBasenames: HTTP_VERBS,
        basenameKey: 'method',
        pathFunc(route, path) {
          let dirname = Path.dirname(path)
          if (dirname === '.') {
            dirname = ''
          }
          route.path = `/${dirname}`
        }
      })

      if (bindToRoot) {
        server.bind(server.root.realm.settings.bind)
      }
      else if (bind) {
        server.bind(bind)
      }

      server.ext(getAndFlattenModules(extArray))
      server.method(getAndFlattenModules(methodsArray))
      server.route(getAndFlattenModules(routesArray))

      next()
    }
    catch (err) {
      next(err)
    }
  })()
}

function entityDefaults(modules, opts) {
  let {
    funcKey,
    postFunc = noop,
    validBasenames,
    basenameKey,
    pathFunc = noop
  } = opts
  return modules.map(([path, mod]) => {
    mod = [].concat(mod).map(entity => {
      if (typeof entity === 'function') {
        entity = { [funcKey]: entity }
        postFunc(entity)
      }
      if (typeof entity !== 'object') {
        return entity
      }

      if (!entity[basenameKey]) {
        let basenameValue = Path.basename(path, '.js')
        let basenameValueCamel = camelCase(basenameValue)
        if (!validBasenames || validBasenames.has(basenameValueCamel)) {
          entity[basenameKey] = basenameValueCamel
        }
      }

      pathFunc(entity, path)

      return entity
    })
    return [path, mod]
  })
}

function getAndFlattenModules(items) {
  return Hoek.flatten(items.map(([, m]) => m))
}

async function getModules(cwd, childpath, patterns) {
  let path = Path.resolve(cwd, childpath)
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

function noop() {}
