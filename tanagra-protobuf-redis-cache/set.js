function bufferToString(buffer) {
  return String.fromCharCode.apply(null, buffer)
}

/**
 * Stores a serialized class in redis.
 *
 * @memberOf module:tanagra-protobuf-redis-cache
 * @function set
 * @param redisClient
 * @param key Unique key used to store serialized class in Redis
 * @param tuple Encoded class and relevant metadata (protobufEncoding, type, schema)
 *
 * @example
 * const redis = require('redis')
 * const redisClient = redis.createClient({ host: 'localhost', port: 6379 })
 * const redisCache = require('./tanagra-protobuf-redis-cache')
 * const protobuf = require('tanagra-protobuf')
 *
 * const foo = new Foo()
 * const encodedTuple = protobuf.encodeEntity(foo)
 * await redisCache.set(redisClient, 'foo', encodedTuple)
 */
module.exports = async (redisClient, key, tuple) => {
  await redisClient.setAsync(`${key}-encoded`, bufferToString(tuple.encoded))
  await redisClient.setAsync(`${key}-type`, tuple.type)
  await redisClient.setAsync(`${key}-schema`, bufferToString(tuple.schema))
}
