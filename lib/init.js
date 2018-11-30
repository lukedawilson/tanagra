const protobuf = require('protobufjs')
const util = require('util')

const loadAsync = util.promisify(protobuf.load)

function serializableClasses(baseModule, map) {
  if (baseModule.exports.prototype && baseModule.exports.prototype.serializationUniqueId) {
    map.set(new baseModule.exports().serializationUniqueId, baseModule.exports.prototype)
  }

  baseModule.children
    .filter(mod => mod.filename.indexOf('node_modules') === -1)
    .forEach(mod => serializableClasses(mod, map))
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

    if (result._serializationUniqueId) {
      Object.setPrototypeOf(result, serializable.get(result._serializationUniqueId))
    }

    return result
  }
}
