const t = require('tap')
const Hapi = require('hapi')
const req = require('require-glob-array')
const HapiMount = require('..')

t.Test.prototype.addAssert('promiseRejects', 2,
  async function promiseRejects(fn, expectedError, message, extra) {
    try {
      await fn()
      this.fail()
    }
    catch (err) {
      this.throws(() => { throw err }, expectedError, message, extra)
    }
  }
)

let parallelTests = [

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
  }),

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
  }),

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
  }),

  t.test("bind to object", async t => {
    let server = new Hapi.Server()
    server.connection()
    await server.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture1`, bind: { simple: true } }
    })

    t.equals((await server.inject('/')).payload, 'hi')
  }),

  t.test("bind to server.realm.settings.bind", async t => {
    let server = new Hapi.Server()
    server.bind({ simple: true })
    server.connection()
    await server.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture1`, bindToRoot: true }
    })

    t.equals((await server.inject('/')).payload, 'hi')
  }),

  t.test("error for invalid modules", async t => {
    let server = new Hapi.Server()
    server.connection()
    await t.promiseRejects(() => server.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture4` }
    }))
  }),

  t.test("error for auto items with missing required properties", async t => {
    let server = new Hapi.Server()
    server.connection()
    await t.promiseRejects(() => server.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture5` }
    }))
  }),

  t.test('default cwd', async t => {
    let server = new Hapi.Server()
    server.connection()
    await server.register({
      register: HapiMount,
      options: { routes: 'test/fixture1/routes' }
    })

    t.equals((await server.inject('/')).payload, 'hello')
  })

]

;(async function() {
  await Promise.all(parallelTests)

  // Run the following tests serially

  await t.test('require relative', async t => {
    let origCwd = process.cwd()
    try {
      process.chdir(__dirname)
      const server = new Hapi.Server()
      server.connection()
      await server.register({
        register: HapiMount,
        options: { cwd: './fixture1' }
      })
      t.pass()
    }
    finally {
      process.chdir(origCwd)
    }
  })

  await t.test("option defaults (no option object provided)", async t => {
    let origCwd = process.cwd()
    try {
      process.chdir(`${__dirname}/fixture1`)
      const server = new Hapi.Server()
      server.connection()
      await server.register(HapiMount)

      t.equals((await server.inject('/')).payload, 'hello')
      t.equals(await server.methods.getCat(), 'meow', "method")
      t.equals((await server.inject('/dog')).payload, 'woof')
    }
    finally {
      process.chdir(origCwd)
    }
  })

})()
