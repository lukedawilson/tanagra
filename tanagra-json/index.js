const serializableClassMappings = require('tanagra-core').serializableClassMappings

exports.encodeEntity = require('./encode-entity')
exports.decodeEntity = require('./decode-entity')

exports.init = function (serializable) {
  if (serializable) {
    serializableClassMappings.set(serializable)
  }
}
