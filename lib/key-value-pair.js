class KeyValuePair {
  constructor(key, value) {
    this.serializable()

    this.key = key
    this.value = value
  }

  serializable() {
    this._serializationKey = module.filename
  }
}

module.exports = KeyValuePair
