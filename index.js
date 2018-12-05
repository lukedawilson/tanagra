const redis = require('redis')
const memcache = require('memory-cache')

const { performance } = require('perf_hooks')

const generateTypeMap = require('tanagra-auto-mapper').generateTypeMap
const json = require('tanagra-json')
const redisCache = require('tanagra-redis-cache')

const initProtobufs = require('./tanagra-protobuf/init')
const decodeEntity = require('./tanagra-protobuf/decode-entity')
const encodeEntity = require('./tanagra-protobuf/encode-entity')

const Foo = require('./models/foo')
const Bar = require('./models/bar')
const Baz = require('./models/baz')

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
})

async function profile(fn, array) {
  const start = performance.now()
  const res = await fn()
  const end = performance.now()
  array.push((end - start))
  return res
}

function showPerfResults(description, array) {
  const aveInc1st = array.reduce((a, b) => a + b, 0) / array.length
  const aveExc1st = array.slice(1).reduce((a, b) => a + b, 0) / (array.length - 1)

  console.log(description)
  array.forEach(t => console.log(t.toPrecision(3)))
  console.log(`Ave (inc. 1st): ${aveInc1st.toPrecision(3)}`)
  console.log(`Ave (exc. 1st): ${aveExc1st.toPrecision(3)}`)
  console.log()
}

function generateTestFoo() {
  const baz = new Baz('Simple Baz', 456456)

  const bar1 = new Bar('Complex Bar 1', new Date(), baz)
  const bar2 = new Bar('Complex Bar 2', new Date(), baz)

  const baz1 = new Baz('baz1', 111)
  const baz2 = new Baz('baz2', 222)
  const baz3 = new Baz('baz3', 333)
  const bazs = new Map()
  bazs.set(baz1.string, baz1)
  bazs.set(baz2.string, baz2)
  bazs.set(baz3.string, baz3)

  return new Foo('Hello foo', 123123, [bar1, bar2], bazs)
}

async function perfTest() {
  const trials = 10

  const protobufWriteTimes = []
  const protobufReadTimes = []
  const jsonWriteTimes = []
  const jsonReadTimes = []

  for (let i = 0; i < trials; i++) {
    let foo = generateTestFoo()
    const encodedEntity = await profile(async () => await encodeEntity(foo), protobufWriteTimes)
    await redisCache.set(redisClient, `foo-${i}`, encodedEntity)
    await initProtobufs(null)
    memcache.clear()

    foo = generateTestFoo()
    const stringifiedEntity = await profile(() => json.encodeEntity(foo), jsonWriteTimes)
    await redisClient.setAsync(`foo-${i}-json`, stringifiedEntity)
    json.init()
    memcache.clear()
  }

  for (let i = 0; i < trials; i++) {
    const tuple = await redisCache.get(redisClient, `foo-${i}`)
    await profile(async () => decodeEntity(tuple, Foo), protobufReadTimes)
    await initProtobufs(null)
    memcache.clear()

    const string = await redisClient.getAsync(`foo-${i}-json`)
    await profile(() => json.decodeEntity(string, Foo), jsonReadTimes)
    json.init()
    memcache.clear()
  }

  console.log('Performance')
  console.log('===========')
  showPerfResults('protobuf-write (ms):', protobufWriteTimes)
  showPerfResults('protobuf-read (ms):', protobufReadTimes)
  showPerfResults('json-write (ms):', jsonWriteTimes)
  showPerfResults('json-read (ms):', jsonReadTimes)
  console.log()
}

async function functionalTest(fn, title, showInputData) {
  const foo = generateTestFoo()

  if (showInputData) {
    console.log('Test data')
    console.log('=========')
    console.log(`foo: ${JSON.stringify(foo, null, 2)}`)
    console.log()
    console.log(`foo.bazs:`)
    console.log(foo.bazs)
    console.log(foo.bazs.get('baz1'))
    console.log()
    console.log(`foo.func1(): ${foo.func1()}`)
    console.log(`foo.get1: ${foo.get1}`)
    console.log(`Foo.staticFunc1(): ${Foo.staticFunc1()}`)
    console.log(`Foo.staticGet1: ${Foo.staticGet1}`)
    console.log()
    console.log(`bar.someFunc(): ${foo.bars[0].someFunc()}`)
    console.log()
    console.log()
  }

  const decoded = await fn(foo)

  title = `Test results (${title})`
  console.log(title)
  console.log(title.split('').map(_ => '=').join(''))
  console.log(`foo: ${JSON.stringify(decoded, null, 2)}`)
  console.log()
  console.log(`foo.bazs:`)
  console.log(decoded.bazs)
  console.log(decoded.bazs.get('baz1'))
  console.log()
  console.log(`foo.func1(): ${decoded.func1()}`)
  console.log(`foo.get1: ${decoded.get1}`)
  console.log(`Foo.staticFunc1(): ${decoded.constructor.staticFunc1()}`)
  console.log(`Foo.staticGet1: ${decoded.constructor.staticGet1}`)
  console.log()
  console.log(`bar.someFunc(): ${decoded.bars[0].someFunc()}`)
  console.log(`baz.someBazFunc(): ${decoded.bars[0].baz.someBazFunc()}`)
  console.log(`baz1.someBazFunc(): ${decoded.bazs.get('baz1').someBazFunc()}`)
  console.log()
  console.log()
}

initProtobufs(generateTypeMap(module))
  .then(() => json.init()) // generateTypeMap(module)
  .then(() => redisCache.init(redisClient))
  .then(perfTest)
  .then(() => functionalTest(async (foo) => {
    const encoded = json.encodeEntity(foo)
    await redisClient.setAsync(`foo-json`, encoded)
    return json.decodeEntity(await redisClient.getAsync(`foo-json`), Foo)
  }, 'json', true))
  .then(() => functionalTest(async (foo) => {
    const encodedTuple = encodeEntity(foo)
    await redisCache.set(redisClient, 'foo', encodedTuple)
    return decodeEntity(await redisCache.get(redisClient, 'foo')) // , Foo
  }, 'protobuf', false))
  .catch(console.log)
  .then(() => process.exit())
