'use strict'

const t = require('tap')
const Hapi = require('hapi')
const req = require('require-glob-array')
const HapiMount = require('..')

const server = new Hapi.Server()
const server2 = new Hapi.Server()
const server3 = new Hapi.Server()

t.test("basic functionality", async t => {
  server.connection()
  await server.register({
    register: HapiMount,
    options: { cwd: `${__dirname}/fixture1` }
  })

  t.equals((await server.inject('/')).payload, 'hello')
  t.equals(await server.methods.getCat(), 'meow', "method")
  t.equals((await server.inject('/dog')).payload, 'woof')
})

t.test("error", async t => {
  server2.connection()
  try {
    await server2.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture2` }
    })
    t.ok(false)
  }
  catch (err) {
    t.ok(err instanceof req.RequireError)
  }
})

t.test("alternate folders + auto routes", async t => {
  let server = server3
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
