function bufferToString(buffer) {
  return String.fromCharCode.apply(null, buffer)
}

module.exports = async (redisClient, key, tuple) => {
  await redisClient.setAsync(`${key}-encoded`, bufferToString(tuple.encoded))
  await redisClient.setAsync(`${key}-type`, tuple.type)
  await redisClient.setAsync(`${key}-schema`, bufferToString(tuple.schema))
}
