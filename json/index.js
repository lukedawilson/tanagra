exports.encodeEntity = require('./encode-entity')
exports.decodeEntity = require('./decode-entity')

exports.init = function (serializable) {
  global.serializable = serializable || new Map()
}
