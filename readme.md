# hapi-mount

Mount directories containing your routes, etc. into your hapi server

[![npm](https://img.shields.io/npm/v/hapi-mount.svg?style=flat-square)](https://www.npmjs.com/package/hapi-mount)
[![Build Status](https://img.shields.io/travis/seangenabe/hapi-mount/master.svg?style=flat-square)](https://travis-ci.org/seangenabe/hapi-mount)
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

* `cwd: string`: Main server directory to look for `routes`, `methods`, and `ext`. Defaults to `process.cwd()`.
* `routes: string`: Name of the routes directory. Defaults to `routes`.
* `methods: string`: Name of the methods directory. Defaults to `methods`.
* `ext: string`: Name of the directory for extension functions. Defaults to `ext`.
* `bind: any`: Object to bind as the context. (Plugin binds are isolated from the global bind.)

## Todo

* Tests

## See also

Oops. Looks like modules of this kind have been done already. Here they are for reference:
* [hapi-methods-injection](https://github.com/amgohan/hapi-methods-injection) (Not quite sure here.)
* [hapi-router](https://github.com/bsiddiqui/hapi-router) (Yep. We're a total rip-off! Hey, we have slightly more features though! I think.)

## License

MIT
