const protobuf = require('protobufjs')
const util = require('util')

const loadAsync = util.promisify(protobuf.load)

module.exports = async (descriptorProtoFilePath) => {
  // Load protodefs for serialising protobuf schemas
  global.protobuf = await loadAsync(descriptorProtoFilePath)

  // Add class and instance functions and getters by setting prototype
  const superDecode = protobuf.Type.prototype.decode
  protobuf.Type.prototype.decode = function(reader, length) {
    const result = superDecode.call(this, reader, length)

    if (result.filePath) {
      Object.setPrototypeOf(result, require(result.filePath).prototype)
    }

    return result
  }
}
