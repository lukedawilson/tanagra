class KeyValuePair {
  constructor(key, value, keySerializationKey, valueSerializationKey) {
    this.serializable()

    this.key = key
    this.value = value
    this._keySerializationKey = keySerializationKey
    this._valueSerializationKey = valueSerializationKey
  }

  serializable() {
    this._serializationKey = module.filename
  }
}

module.exports = KeyValuePair
