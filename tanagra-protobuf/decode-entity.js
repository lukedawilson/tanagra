const protobuf = require('protobufjs')

const CustomReader = require('./custom-reader')

function decodeEntity(tuple, clazz) {
  const entity = new Buffer(tuple.encoded || [])
  const json = global.protobuf.Type.decode(tuple.schema)
  const message = protobuf.Type.fromJSON(tuple.type, json)

  message.setClazz(clazz)

  return message.decode(new CustomReader(entity))
}

module.exports = decodeEntity
