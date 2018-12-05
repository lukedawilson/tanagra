function stringToBuffer(bufferString) {
  const buffer = new Uint8Array(bufferString.length)
  for (let i = 0; i < bufferString.length; i++) {
    buffer[i] = bufferString.charCodeAt(i)
  }
  return buffer
}

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
