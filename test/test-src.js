'use strict'

const t = require('tap')
const Hapi = require('hapi')
const req = require('require-glob-array')
const HapiMount = require('..')

t.test('require relative', async t => {
  try {
    const server = new Hapi.Server()
    server.connection()
    await server.register({
      register: HapiMount,
      options: { cwd: './test/fixture1' }
    })
  }
  catch (err) {
    t.threw(err)
  }
})

t.test("basic functionality", async t => {
  try {
    const server = new Hapi.Server()
    server.connection()
    await server.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture1` }
    })

    t.equals((await server.inject('/')).payload, 'hello')
    t.equals(await server.methods.getCat(), 'meow', "method")
    t.equals((await server.inject('/dog')).payload, 'woof')
  }
  catch (err) {
    t.threw(err)
  }
})

t.test("error", async t => {
  const server = new Hapi.Server()
  server.connection()
  try {
    await server.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture2` }
    })
    t.fail()
  }
  catch (err) {
    t.ok(err instanceof req.RequireError)
  }
})

t.test("alternate folders + auto routes", async t => {
  const server = new Hapi.Server()
  server.connection()
  await server.register({
    register: HapiMount,
    options: {
      cwd: `${__dirname}/fixture3`,
      ext: '_ext',
      methods: '_methods',
      routes: '_routes'
    }
  })

  t.equals(await server.methods.getCat(), 'meow')
  t.equals((await server.inject('/dog')).payload, 'woof')
  t.equals((await server.inject('/auto')).payload, 'quack')
  t.equals(
    (await server.inject({ method: 'DELETE', url: '/auto'})).payload,
    'neigh'
  )
})

t.test("bind to object", async t => {
  let server = new Hapi.Server()
  server.connection()
  await server.register({
    register: HapiMount,
    options: { cwd: `${__dirname}/fixture1`, bind: { simple: true } }
  })

  t.equals((await server.inject('/')).payload, 'hi')
})

t.test("bind to server.realm.settings.bind", async t => {
  let server = new Hapi.Server()
  server.bind({ simple: true })
  server.connection()
  await server.register({
    register: HapiMount,
    options: { cwd: `${__dirname}/fixture1`, bindToRoot: true }
  })

  t.equals((await server.inject('/')).payload, 'hi')
})
