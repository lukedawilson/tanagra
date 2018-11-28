const protobuf = require('protobufjs')

function decodeEntity(tuple) {
  const entity = new Buffer(tuple.encoded || [])

  const type = tuple.type
  const filePath = tuple.filePath

  // Build type map
  const typeMap = protobuf.Type.fromJSON(type, JSON.parse(tuple.typeMap))

  // Add data
  const decoded = typeMap.decode(entity)

  // Add functions
  if (filePath) {
    Object.setPrototypeOf(decoded, require(filePath).prototype)
  }

  return decoded
}

module.exports = decodeEntity
