# hapi-mount

Mount directories containing your routes, etc. into your hapi server

[![npm](https://img.shields.io/npm/v/hapi-mount.svg?style=flat-square)](https://www.npmjs.com/package/hapi-mount)
[![Build Status](https://img.shields.io/travis/seangenabe/hapi-mount/master.svg?style=flat-square)](https://travis-ci.org/seangenabe/hapi-mount)
[![Coverage Status](https://img.shields.io/coveralls/seangenabe/hapi-mount/master.svg?style=flat-square)](https://coveralls.io/github/seangenabe/hapi-mount?branch=master)
[![Dependency Status](https://img.shields.io/david/seangenabe/hapi-mount.svg?style=flat-square)](https://david-dm.org/seangenabe/hapi-mount)
[![devDependency Status](https://img.shields.io/david/dev/seangenabe/hapi-mount.svg?style=flat-square)](https://david-dm.org/seangenabe/hapi-mount#info=devDependencies)
[![node](https://img.shields.io/node/v/hapi-mount.svg?style=flat-square)](https://nodejs.org/en/download/)

## Usage

### Intro

This module will allow you to organize your handlers as such:
```
- server/
  - ext/
    - on-post-auth.js
  - methods/
    - get-user.js
  - routes/
    - user/
      - get.js
      - post.js
```

A single object of the array overloads for [`server.ext`](http://hapijs.com/api#serverextevents), [`server.method`](http://hapijs.com/api#servermethodmethods), and `server.route` must be exported. An array can also be used, this module will flatten the array anyway.

For the `ext` and `methods` directories, this will `require` all .js files inside them.

For the `routes` directory, only valid HTTP verbs in lowercase (`get.js`, `post.js`, etc.) are included.

Example (just to give you an idea how modular your server will be now):

ext/on-post-auth.js
```javascript
module.exports = {
  type: 'onPostAuth',
  method: function(request, reply) { /* ... */ }
}
```

methods/get-user.js
```javascript
module.exports = {
  name: 'getUsers',
  method: function(next) { /* ... */ }
}
```

routes/user/get.js
```javascript
module.exports = {
  path: '/user',
  method: 'GET',
  handler: function(request, reply) { /* ... */ }
}
```

Note: Modules with empty exports will be excluded. This is to avoid errors in development, e.g. when creating a new blank file. (Hapi will emit an error anyway for these files since they don't match the schema.) Modules that export `null` or `undefined` will also be excluded.

### General usage

```javascript
server.register(
  {
    register: require('hapi-mount'),
    options: { /* cwd, routes, methods, ext */ }
  },
  options,
  callback
)
```

### Registration options

* `cwd: string`: Main server directory to look for `routes`, `methods`, and `ext`. Default: `"."`. This is resolved against the current working directory.
* `routes: string`: Name of the routes directory. Default: `"routes"`.
* `methods: string`: Name of the methods directory. Default: `"methods"`.
* `ext: string`: Name of the directory for extension functions. Default: `"ext"`
* `bind: object`: Object to bind as the context. (Plugin binds are [isolated](http://hapijs.com/api#serverbindcontext).) Optional.
* `bindToRoot: boolean`: Bind to `server.root.realm.settings.bind` as the context. This is always the object you set with `server.bind` outside plugins, so be sure to do that first, when using this option, before registration.

### Path defaults

#### Routes

If the route object is a function, it will be transformed into the handler (`handler`) for the route.

If you use the format described above for specifying routes, the `path` and `method` will default to the path `dirname` and `basename`, respectively. For example, a file at `foo/bar/get.js` will default all of its exported objects with `{ path: '/foo/bar', method: 'get' }`.

#### ext

If the ext object is a function, it will be transformed into the `method` property for the ext object.

If you use the kebab case version of a valid Hapi extension point as the filename, the `type` will default to that extension point. For example, a file at `on-pre-response.js` will default to `{ type: 'onPreResponse' }`.

#### Methods

If the method object is a function, it will be transformed into the `method` property for the method object. `options.callback` will also default to `false` to make it possible to declare `Promise`-returning functions. (This is just a personal preference *against* callbacks.)

If you don't specify the `name` for the method, the name will default to the camel case version of the basename of the file. For example, a file at `get-database.js` will default to `{ name: 'getDatabase' }`

#### All of these are optional!

If this behavior isn't your style, simply specify everything in the schema.

## See also

Oops. Looks like modules of this kind have been done already. Here they are for reference:
* [hapi-methods-injection](https://github.com/amgohan/hapi-methods-injection) (Not quite sure here.)
* [hapi-router](https://github.com/bsiddiqui/hapi-router) (We definitely have more features than them now.)

## License

MIT
