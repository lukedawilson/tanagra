const serializable = require('tanagra-core').serializable

class KeyValuePair {
  constructor(key, value, keySerializationKey, valueSerializationKey) {
    this.key = key
    this.value = value
    this._keySerializationKey = keySerializationKey
    this._valueSerializationKey = valueSerializationKey
  }
}

module.exports = serializable(KeyValuePair, module.filename)
