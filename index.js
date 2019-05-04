const pkg = require('./package')
const Path = require('path')
const req = require('require-glob-array')
const camelCase = require('lodash.camelcase')
const { deprecate } = require('util')
const flatMap = require('core-js-pure/features/array/flat-map')

const HTTP_VERBS = new Set([
  'get',
  'post',
  'put',
  'delete',
  'trace',
  'options',
  'connect',
  'patch'
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
const bindToRootMessage = deprecate(
  () => undefined,
  'The option bindToRoot is deprecated. Use bindParentContext instead.'
)

module.exports = {
  name: pkg.name,
  version: pkg.version,
  async register(server, opts) {
    const {
      cwd = '.',
      ext = 'ext',
      methods = 'methods',
      routes = 'routes',
      bind,
      bindParentContext,
      bindToRoot
    } = opts
    let [extArray, methodsArray, routesArray] = await Promise.all([
      getModules(cwd, ext),
      getModules(cwd, methods),
      getModules(
        cwd,
        routes,
        '**/{get,post,put,delete,trace,options,connect,patch}.js'
      )
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
      basenameKey: 'name'
    })

    // Auto routes
    routesArray = entityDefaults(routesArray, {
      funcKey: 'handler',
      validBasenames: HTTP_VERBS,
      basenameKey: 'method',
      pathFunc(route, path) {
        if (route.path) {
          return
        }
        let dirname = Path.dirname(path)
        if (dirname === '.') {
          dirname = ''
        }
        route.path = `/${dirname}`
      }
    })

    if (bindToRoot || bindParentContext) {
      if (bindToRoot) {
        bindToRootMessage()
      }
      server.bind(server.realm.parent.settings.bind)
    } else if (bind) {
      server.bind(bind)
    }

    server.ext(getAndFlattenModules(extArray))
    server.method(getAndFlattenModules(methodsArray))
    server.route(getAndFlattenModules(routesArray))
  }
}

function entityDefaults(
  modules,
  { funcKey, validBasenames, basenameKey, pathFunc = noop }
) {
  return modules.map(([path, mod]) => {
    mod = [].concat(mod).map(entity => {
      if (typeof entity === 'function') {
        entity = { [funcKey]: entity }
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
  return flatMap(items, ([, m]) => m)
}

async function getModules(cwd, childpath, patterns) {
  let path = Path.resolve(cwd, childpath)
  let opts = { cwd: path, returnPath: true }
  let modules
  if (patterns) {
    modules = await req.async(patterns, opts)
  } else {
    modules = await req.async(opts)
  }
  modules = modules.filter(([, mod]) => {
    return !(
      mod == null ||
      (isPlainObject(mod) && Object.keys(mod).length === 0)
    )
  })
  return modules
}

function isPlainObject(obj) {
  return obj.constructor === Object
}

function noop() {}
