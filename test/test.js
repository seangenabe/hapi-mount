'use strict'

const t = require('tap')
const Hapi = require('hapi')
const HapiMount = require('..')

const server = new Hapi.Server()

t.test(() => {
  server.connection()
  return server.register({
    register: HapiMount,
    options: { cwd: __dirname }
  })
})
.then(() => {
  return server.inject('/').then(res => {
    t.ok(res.payload === 'hello')
  })
})
.then(() => {
  return server.methods.getCat().then(cat => {
    t.ok(cat === 'meow')
  })
})
.then(() => {
  return server.inject('/dog').then(r => {
    let dog = r.payload
    t.ok(dog === 'woof')
  })
})
.catch(t.threw)
