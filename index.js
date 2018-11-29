const util = require('util')
const redis = require('redis')
const protobuf = require('protobufjs')

const decodeEntity = require('./lib/decode-entity')
const encodeEntity = require('./lib/encode-entity')

const loadAsync = util.promisify(protobuf.load)

const Foo = require('./models/foo')

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
  global.protobuf = await loadAsync('./proto/descriptor.proto')

  const entity = new Foo()

  console.log('Before')
  console.log('======')
  console.log(entity)
  console.log(`func1: ${entity.func1}`)
  console.log(`func1(): ${entity.func1()}`)
  console.log()

  console.log('During')
  console.log('======')

  const encodedTuple = await profile(() => encodeEntity(entity), 'encode')

  await profile(async () => {
    await redisClient.setAsync(`foo-encoded`, bufferToString(encodedTuple.encoded))
    await redisClient.setAsync(`foo-type`, encodedTuple.type)
    await redisClient.setAsync(`foo-file-path`, encodedTuple.filePath)
    await redisClient.setAsync(`foo-schema`, bufferToString(encodedTuple.schema))
  }, 'save to redis')

  const encodedFromRedis = await profile(async () => {
    const encoded = stringToBuffer(await redisClient.getAsync(`foo-encoded`))
    const type = await redisClient.getAsync(`foo-type`)
    const filePath = await redisClient.getAsync(`foo-file-path`)
    const schema = stringToBuffer(await redisClient.getAsync(`foo-schema`))
    return { encoded, type, filePath, schema }
  }, 'retrieve from redis')

  const decoded = await profile(() => decodeEntity(encodedFromRedis), 'decode')

  console.log()
  console.log('After')
  console.log('=====')
  console.log(decoded)
  console.log(`func1: ${decoded.func1}`)
  console.log(`func1(): ${decoded.func1()}`)
}

main().then(() => process.exit())
