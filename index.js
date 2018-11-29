const util = require('util')
const redis = require('redis')
const protobuf = require('protobufjs')

const decodeEntity = require('./lib/decode-entity')
const encodeEntity = require('./lib/encode-entity')
const connection = require('./db/connection')

const loadAsync = util.promisify(protobuf.load)

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

async function profile(fn, description) {
  const start = new Date().getTime()
  const res = await fn()
  console.log(`${description} (ms): ${new Date().getTime() - start}`)
  return res
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

async function main () {
  // Load protodefs for serialising protobuf schemas
  global.protobuf = await loadAsync('./proto/descriptor.proto')

  // Set up test data
  const baz = new Baz('Simple Baz', 456456)
  const bar1 = new Bar('Complex Bar 1', new Date(), baz)
  const bar2 = new Bar('Complex Bar 2', new Date(), baz)
  const foo = new Foo('Hello foo', 123123, [bar1, bar2])

  console.log('Test data')
  console.log('=========')
  console.log(foo)
  console.log(`func1: ${foo.func1}`)
  console.log(`func1(): ${foo.func1()}`)
  console.log()

  // Test protobuf/redis
  console.log('Performance')
  console.log('===========')

  await profile(async () => {
    const encodedTuple = await profile(() => encodeEntity(foo), 'encode')

    await profile(async () => {
      await redisClient.setAsync(`foo-encoded`, bufferToString(encodedTuple.encoded))
      await redisClient.setAsync(`foo-type`, encodedTuple.type)
      await redisClient.setAsync(`foo-file-path`, encodedTuple.filePath)
      await redisClient.setAsync(`foo-schema`, bufferToString(encodedTuple.schema))
    }, 'save to redis')
  }, 'total - encode, save to redis')

  const decoded = await profile(async () => {
    const encodedFromRedis = await profile(async () => {
      const encoded = stringToBuffer(await redisClient.getAsync(`foo-encoded`))
      const type = await redisClient.getAsync(`foo-type`)
      const filePath = await redisClient.getAsync(`foo-file-path`)
      const schema = stringToBuffer(await redisClient.getAsync(`foo-schema`))
      return {encoded, type, filePath, schema}
    }, 'retrieve from redis')

    return profile(() => decodeEntity(encodedFromRedis), 'decode')
  }, 'total - retrieve from redis, decode')

  console.log()

  // Test db
  const fooId = await profile(async () => await connection.writeFoo(foo), 'write to db')
  const fooFromDb = await profile(async () => await connection.readFoo(fooId), 'read from db')

  console.log()

  // Test JSON.parse
  const json = await profile(() => JSON.stringify(foo), 'JSON.stringify')
  const fromJson = await profile(() => JSON.parse(json), 'JSON.parse')

  // Show results
  console.log()
  console.log('Results')
  console.log('=======')
  console.log('Redis/protobufs:')
  console.log()
  console.log(decoded)
  console.log(`func1: ${decoded.func1}`)
  console.log(`func1(): ${decoded.func1()}`)
  console.log()
  console.log('Database:')
  console.log()
  console.log(fooFromDb)
  console.log()
  console.log('JSON.stringify/parse:')
  console.log()
  console.log(fromJson)
}

main().then(() => process.exit())
