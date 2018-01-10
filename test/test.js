const test = require('ava')
const Hapi = require('hapi')
const req = require('require-glob-array')
const HapiMount = require('../')

test('basic functionality', async t => {
  const server = new Hapi.Server()
  await server.register({
    plugin: HapiMount,
    options: { cwd: `${__dirname}/fixture1` }
  })

  t.is((await server.inject('/')).payload, 'hello')
  t.is(await server.methods.getCat(), 'meow', 'method')
  t.is((await server.inject('/dog')).payload, 'woof')
})

test('error', async t => {
  const server = new Hapi.Server()
  try {
    await server.register({
      plugin: HapiMount,
      options: { cwd: `${__dirname}/fixture2` }
    })
    t.fail()
  } catch (err) {
    t.true(err instanceof req.RequireError)
  }
})

test('alternate folders + auto routes', async t => {
  const server = new Hapi.Server()
  await server.register({
    plugin: HapiMount,
    options: {
      cwd: `${__dirname}/fixture3`,
      ext: '_ext',
      methods: '_methods',
      routes: '_routes'
    }
  })

  t.is(await server.methods.getCat(), 'meow')
  t.is((await server.inject('/dog')).payload, 'woof')
  t.is((await server.inject('/auto')).payload, 'quack')
  t.is(
    (await server.inject({ method: 'DELETE', url: '/auto' })).payload,
    'neigh'
  )
})

test('bind to object', async t => {
  const server = new Hapi.Server()
  await server.register({
    plugin: HapiMount,
    options: { cwd: `${__dirname}/fixture1`, bind: { simple: true } }
  })

  t.is((await server.inject('/')).payload, 'hi')
})

test('error for invalid modules', async t => {
  const server = new Hapi.Server()
  await t.throws(
    server.register({
      plugin: HapiMount,
      options: { cwd: `${__dirname}/fixture4` }
    })
  )
})

test('error for auto items with missing required properties', async t => {
  const server = new Hapi.Server()
  await t.throws(
    server.register({
      plugin: HapiMount,
      options: { cwd: `${__dirname}/fixture5` }
    })
  )
})

test('default cwd', async t => {
  const server = new Hapi.Server()
  await server.register({
    plugin: HapiMount,
    options: { routes: 'test/fixture1/routes' }
  })

  t.is((await server.inject('/')).payload, 'hello')
})

test('should not override route path', async t => {
  const server = new Hapi.Server()
  await server.register({
    plugin: HapiMount,
    options: { cwd: `${__dirname}/fixture6` }
  })

  t.is((await server.inject('/b')).payload, 'b')
})

test.serial('require relative', async t => {
  let origCwd = process.cwd()
  try {
    process.chdir(__dirname)
    const server = new Hapi.Server()
    await server.register({
      plugin: HapiMount,
      options: { cwd: './fixture1' }
    })
    t.pass()
  } finally {
    process.chdir(origCwd)
  }
})

test.serial('option defaults (no option object provided)', async t => {
  let origCwd = process.cwd()
  try {
    process.chdir(`${__dirname}/fixture1`)
    const server = new Hapi.Server()
    await server.register(HapiMount)

    t.is((await server.inject('/')).payload, 'hello')
    t.is(await server.methods.getCat(), 'meow', 'method')
    t.is((await server.inject('/dog')).payload, 'woof')
  } finally {
    process.chdir(origCwd)
  }
})
