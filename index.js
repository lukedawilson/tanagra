const util = require('util')
const redis = require('redis')

const decodeEntity = require('./lib/decode-entity')
const encodeEntity = require('./lib/encode-entity')

const Foo = require('./models/foo')

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
})

redisClient.getAsync = util.promisify(redisClient.get)
redisClient.setAsync = util.promisify(redisClient.set)
redisClient.delAsync = util.promisify(redisClient.del)
redisClient.keysAsync = util.promisify(redisClient.keys)

function profile(fn, description) {
  const start = new Date().getTime()
  const res = fn()
  console.log(`${description} - time taken (ms): ${new Date().getTime() - start}`)
  return res
}

async function main () {
  const entity = new Foo()

  console.log('Before')
  console.log('======')
  console.log(entity)
  console.log(entity.func1)
  console.log()

  console.log('During')
  console.log('======')

  const encoded = profile(() => encodeEntity(entity), 'encode')
  await redisClient.setAsync(`awesome-entity`, JSON.stringify(encoded))

  const encodedFromRedis = await redisClient.getAsync(`awesome-entity`)
  const decoded = profile(() => decodeEntity(JSON.parse(encodedFromRedis)), 'decode')

  console.log()
  console.log('After')
  console.log('=====')
  console.log(decoded)
  console.log(decoded.func1)
}

main().then(() => process.exit())
