const protobuf = require('protobufjs')

function decodeEntity(tuple) {
  const entity = new Buffer(tuple.encoded || [])

  const type = tuple.type
  const filePath = tuple.filePath

  // Build type map
  const message = protobuf.Type.fromJSON(type, JSON.parse(tuple.message))

  // Add data
  const decoded = message.decode(entity)

  // Add functions
  if (filePath) {
    Object.setPrototypeOf(decoded, require(filePath).prototype)
  }

  return decoded
}

module.exports = decodeEntity
