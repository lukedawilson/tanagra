const protobuf = require('protobufjs')

const CustomReader = require('./custom-reader')

function decodeEntity(tuple) {
  const entity = new Buffer(tuple.encoded || [])

  const type = tuple.type
  const filePath = tuple.filePath

  // Build type map
  const json = global.protobuf.root.lookupType('Type').decode(tuple.schema)
  const message = protobuf.Type.fromJSON(type, json)

  // Add data
  const decoded = message.decode(new CustomReader(entity))

  // Add functions
  if (filePath) {
    Object.setPrototypeOf(decoded, require(filePath).prototype)
  }

  return decoded
}

module.exports = decodeEntity
