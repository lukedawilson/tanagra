const serializable = require('tanagra-core').serializable
const getTypeId = require('./get-type-id')

class KeyValuePair {
  constructor(key, value) {
    this.key = key
    this.value = value
    this._keySerializationKey = getTypeId(key)
    this._valueSerializationKey = getTypeId(value)
  }
}

/*
 * A key-value-pair for serializable types, used for serializing instances of Map.
 */
module.exports = serializable(KeyValuePair)
