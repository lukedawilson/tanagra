const protobuf = require('protobufjs')
const util = require('util')

const serializableClassMappings = require('tanagra-core').serializableClassMappings

const KeyValuePair = require('./key-value-pair')

const loadAsync = util.promisify(protobuf.load)

/**
 * Initializes the protobuf serializer.
 *
 * @memberOf module:tanagra-protobuf
 * @function init
 * @param serializableTypeMap Optional map of (unique key -> prototype) specifying serializable types
 *                            to add to initial cache.
 * @returns {Promise.<void>}
 */
module.exports = async (serializableTypeMap) => {
  if (serializableTypeMap) {
    serializableClassMappings.set(serializableTypeMap)
  }

  serializableClassMappings.get().set(KeyValuePair._serializationKey, KeyValuePair.prototype)

  // Load protodefs for serialising protobuf schemas
  const root = await loadAsync(`${__dirname}/descriptor.proto`)
  global.protobuf = { Type: root.lookupType('Type') }
}
