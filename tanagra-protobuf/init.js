const protobuf = require('protobufjs')
const util = require('util')

const serializableClassMappings = require('tanagra-core').serializableClassMappings

const KeyValuePair = require('./key-value-pair')

const loadAsync = util.promisify(protobuf.load)

module.exports = async (serializable) => {
  if (serializable) {
    serializableClassMappings.set(serializable)
  }

  serializableClassMappings.get().set(KeyValuePair._serializationKey, KeyValuePair.prototype)

  // Load protodefs for serialising protobuf schemas
  const root = await loadAsync(`${__dirname}/descriptor.proto`)
  global.protobuf = { Type: root.lookupType('Type') }
}
