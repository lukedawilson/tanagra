const protobuf = require('protobufjs')
const util = require('util')

const loadAsync = util.promisify(protobuf.load)

function serializableClasses(baseModule, map) {
  if (baseModule.exports.prototype && baseModule.exports.prototype.serializable) {
    map.set(new baseModule.exports()._serializationKey, baseModule.exports.prototype)
  }

  baseModule.children
    .filter(mod => mod.filename.indexOf('node_modules') === -1)
    .forEach(mod => serializableClasses(mod, map))
}

function deserializeMap(kvp, result) {
  const map = new Map()
  result[kvp.key].forEach(kvp2 => map.set(kvp2.key, kvp2.value))

  const originalKey = kvp.key.split('_')[0]
  result[originalKey] = map

  delete result[kvp.key]
}

module.exports = async (descriptorProtoFilePath, baseModule) => {
  // Generate type map from serialization metadata
  const serializable = new Map()
  serializableClasses(baseModule, serializable)

  // Load protodefs for serialising protobuf schemas
  const root = await loadAsync(descriptorProtoFilePath)
  global.protobuf = { Type: root.lookupType('Type') }

  // Add class and instance functions and getters by setting prototype
  const superDecode = protobuf.Type.prototype.decode
  protobuf.Type.prototype.decode = function(reader, length) {
    const result = superDecode.call(this, reader, length)

    // Set prototype, which contains fields, getters, static members
    if (result._serializationKey) {
      Object.setPrototypeOf(result, serializable.get(result._serializationKey))
    }

    // Handle maps as a special case
    Object.entries(result)
      .map(entry => ({ key: entry[0], value: entry[1]}))
      .filter(kvp => kvp.key.indexOf('_map') !== -1)
      .forEach(kvp => deserializeMap(kvp, result))

    return result
  }
}
