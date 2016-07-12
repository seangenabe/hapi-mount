'use strict'

const t = require('tap')
const Hapi = require('hapi')
const HapiMount = require('..')

const server = new Hapi.Server()

t.test(async function(t) {
  server.connection()
  await server.register({
    register: HapiMount,
    options: { cwd: `${__dirname}/fixture1` }
  })

  let res = await server.inject('/')
  t.ok(res.payload === 'hello')

  let cat = await server.methods.getCat()
  t.ok(cat === 'meow')

  let dog = (await server.inject('/dog')).payload
  t.ok(dog === 'woof')
})
