const protobuf = require('protobufjs')

const CustomReader = require('./custom-reader')

function decodeEntity(tuple) {
  const entity = new Buffer(tuple.encoded || [])
  const json = global.protobuf.root.lookupType('Type').decode(tuple.schema)
  const message = protobuf.Type.fromJSON(tuple.type, json)
  return message.decode(new CustomReader(entity))
}

module.exports = decodeEntity
