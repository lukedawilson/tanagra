function stringToBuffer(bufferString) {
  const buffer = new Uint8Array(bufferString.length)
  for (let i = 0; i < bufferString.length; i++) {
    buffer[i] = bufferString.charCodeAt(i)
  }
  return buffer
}

module.exports = async (redisClient, key) => {
  const encoded = stringToBuffer(await redisClient.getAsync(`${key}-encoded`))
  const type = await redisClient.getAsync(`${key}-type`)
  const schema = stringToBuffer(await redisClient.getAsync(`${key}-schema`))
  return {encoded, type, schema}
}
