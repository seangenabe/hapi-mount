const test = require('ava')
const Hapi = require('hapi')
const req = require('require-glob-array')
const HapiMount = require('..')

let parallelTests = [

  test.test("basic functionality", async t => {
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

  test.test("error", async t => {
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

  test.test("alternate folders + auto routes", async t => {
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

  test.test("bind to object", async t => {
    let server = new Hapi.Server()
    server.connection()
    await server.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture1`, bind: { simple: true } }
    })

    t.equals((await server.inject('/')).payload, 'hi')
  }),

  test.test("bind to server.realm.settings.bind", async t => {
    let server = new Hapi.Server()
    server.bind({ simple: true })
    server.connection()
    await server.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture1`, bindToRoot: true }
    })

    t.equals((await server.inject('/')).payload, 'hi')
  }),

  test.test("error for invalid modules", async t => {
    let server = new Hapi.Server()
    server.connection()
    await t.promiseRejects(() => server.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture4` }
    }))
  }),

  test.test("error for auto items with missing required properties", async t => {
    let server = new Hapi.Server()
    server.connection()
    await t.promiseRejects(() => server.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture5` }
    }))
  }),

  test.test('default cwd', async t => {
    let server = new Hapi.Server()
    server.connection()
    await server.register({
      register: HapiMount,
      options: { routes: 'test/fixture1/routes' }
    })

    t.equals((await server.inject('/')).payload, 'hello')
  }),

  test.test('should not override route path', async t => {
    let server = new Hapi.Server()
    server.connection()
    await server.register({
      register: HapiMount,
      options: { cwd: `${__dirname}/fixture6` }
    })

    t.equals((await server.inject('/b')).payload, 'b')
  })
]

;(async function() {
  await Promise.all(parallelTests)

  // Run the following tests serially

  await test.test('require relative', async t => {
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

  await test.test("option defaults (no option object provided)", async t => {
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
