const util = require('util')
const redis = require('redis')
const { performance } = require('perf_hooks')

const decodeEntity = require('./lib/decode-entity')
const encodeEntity = require('./lib/encode-entity')
const connection = require('./db/connection')
const initProtobufs = require('./lib/init')

const Foo = require('./models/foo')
const Bar = require('./models/bar')
const Baz = require('./models/baz')

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
})

redisClient.lpushAsync = util.promisify(redisClient.lpush)
redisClient.lrangeAsync = util.promisify(redisClient.lrange)
redisClient.getAsync = util.promisify(redisClient.get)
redisClient.setAsync = util.promisify(redisClient.set)
redisClient.delAsync = util.promisify(redisClient.del)
redisClient.keysAsync = util.promisify(redisClient.keys)

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

  return { aveInc1st, aveExc1st }
}

function bufferToString(buffer) {
  return String.fromCharCode.apply(null, buffer)
}

function stringToBuffer(bufferString) {
  const buffer = new Uint8Array(bufferString.length)
  for (let i = 0; i < bufferString.length; i++) {
    buffer[i] = bufferString.charCodeAt(i)
  }
  return buffer
}

async function writeToRedis(key, tuple) {
  await redisClient.setAsync(`${key}-encoded`, bufferToString(tuple.encoded))
  await redisClient.setAsync(`${key}-type`, tuple.type)
  await redisClient.setAsync(`${key}-schema`, bufferToString(tuple.schema))
}

async function fetchFromRedis(key) {
  const encoded = stringToBuffer(await redisClient.getAsync(`${key}-encoded`))
  const type = await redisClient.getAsync(`${key}-type`)
  const schema = stringToBuffer(await redisClient.getAsync(`${key}-schema`))
  return {encoded, type, schema}
}

function generateTestFoo() {
  const baz = new Baz('Simple Baz', 456456)
  const bar1 = new Bar('Complex Bar 1', new Date(), baz)
  const bar2 = new Bar('Complex Bar 2', new Date(), baz)
  return new Foo('Hello foo', 123123, [bar1, bar2])
}

async function perfTest() {
  const trials = 10

  const dbWriteTimes = []
  const protobufWriteTimes = []
  const redisWriteTimes = []
  const dbReadTimes = []
  const redisReadTimes = []
  const protobufReadTimes = []

  const ids = []
  for (let i = 0; i < trials; i++) {
    const foo = generateTestFoo()
    ids.push(await profile(async () => await connection.writeFoo(foo), dbWriteTimes))
  }

  for (let i = 0; i < trials; i++) {
    const foo = generateTestFoo()
    const encodedEntity = await profile(async () => await encodeEntity(foo), protobufWriteTimes)
    await profile(async () => await writeToRedis(`foo-${i}`, encodedEntity), redisWriteTimes)
  }

  for (let i = 0; i < trials; i++) {
    const id = ids[i]
    await profile(async () => await connection.readFoo(id), dbReadTimes)
  }

  for (let i = 0; i < trials; i++) {
    const tuple = await profile(async () => await fetchFromRedis(`foo-${i}`), redisReadTimes)
    await profile(async () => decodeEntity(tuple), protobufReadTimes)
  }

  console.log('Performance')
  console.log('===========')

  showPerfResults('db-write (ms):', dbWriteTimes)

  const protobufWritePerf = showPerfResults('protobuf-write (ms):', protobufWriteTimes)
  const redisWritePerf = showPerfResults('redis-write (ms):', redisWriteTimes)

  console.log('protobuf-redis-write (ms):')
  console.log(`Ave (inc. 1st): ${(protobufWritePerf.aveInc1st + redisWritePerf.aveInc1st).toPrecision(3)}`)
  console.log(`Ave (exc. 1st): : ${(protobufWritePerf.aveExc1st + redisWritePerf.aveExc1st).toPrecision(3)}`)
  console.log()

  showPerfResults('db-read (ms):', dbReadTimes)

  const redisReadPerf = showPerfResults('redis-read (ms):', redisReadTimes)
  const protobufReadPerf = showPerfResults('protobuf-read (ms):', protobufReadTimes)

  console.log('protobuf-redis-read (ms):')
  console.log(`Ave (inc. 1st): ${(protobufReadPerf.aveInc1st + redisReadPerf.aveInc1st).toPrecision(3)}`)
  console.log(`Ave (exc. 1st): : ${(protobufReadPerf.aveExc1st + redisReadPerf.aveExc1st).toPrecision(3)}`)
  console.log()
  console.log()
}

async function functionalTest() {
  const foo = generateTestFoo()

  console.log('Test input')
  console.log('==========')
  console.log(`foo: ${JSON.stringify(foo, null, 2)}`)
  console.log()
  console.log(`foo.func1(): ${foo.func1()}`)
  console.log(`foo.get1: ${foo.get1}`)
  console.log(`Foo.staticFunc1(): ${Foo.staticFunc1()}`)
  console.log(`Foo.staticGet1: ${Foo.staticGet1}`)
  console.log()
  console.log(`bar.someFunc(): ${foo.bars[0].someFunc()}`)
  console.log()
  console.log()

  const encodedTuple = encodeEntity(foo)
  await writeToRedis('foo', encodedTuple)

  const decodedTuple = await fetchFromRedis('foo')
  const decoded =  decodeEntity(decodedTuple)

  console.log('Test output')
  console.log('===========')
  console.log(`foo: ${JSON.stringify(decoded, null, 2)}`)
  console.log()
  console.log(`foo.func1(): ${decoded.func1()}`)
  console.log(`foo.get1: ${decoded.get1}`)
  console.log(`Foo.staticFunc1(): ${decoded.constructor.staticFunc1()}`)
  console.log(`Foo.staticGet1: ${decoded.constructor.staticGet1}`)
  console.log()
  console.log(`bar.someFunc(): ${decoded.bars[0].someFunc()}`)
  console.log()
  console.log()
}

initProtobufs('./proto/descriptor.proto', module)/*.then(perfTest)*/.then(functionalTest).catch(console.log).then(() => process.exit())
