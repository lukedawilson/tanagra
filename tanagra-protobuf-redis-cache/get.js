function stringToBuffer(bufferString) {
  const buffer = new Uint8Array(bufferString.length)
  for (let i = 0; i < bufferString.length; i++) {
    buffer[i] = bufferString.charCodeAt(i)
  }
  return buffer
}

/**
 * Retrieves a serialized class from redis.
 *
 * @memberOf module:tanagra-protobuf-redis-cache
 * @function get
 * @param redisClient
 * @param key Unique key used to store serialized class in Redis
 *
 * @returns Object Encoded class and relevant metadata
 * @example
 * const redis = require('redis')
 * const redisClient = redis.createClient({ host: 'localhost', port: 6379 })
 * const redisCache = require('./tanagra-protobuf-redis-cache')
 * const protobuf = require('tanagra-protobuf')
 *
 * const encoded = await redisCache.get(redisClient, 'foo')
 * const instance = protobuf.decodeEntity(encoded)
 */
module.exports = async (redisClient, key) => {
  const encodedFromRedis = await redisClient.getAsync(`${key}-encoded`)
  if (!encodedFromRedis) {
    return null
  }

  const encoded = stringToBuffer(encodedFromRedis)

  const type = await redisClient.getAsync(`${key}-type`)
  if (!type) {
    return null
  }

  const schemaFromRedis = await redisClient.getAsync(`${key}-schema`)
  if (!schemaFromRedis) {
    return null
  }

  const schema = stringToBuffer(schemaFromRedis)

  return {encoded, type, schema}
}
