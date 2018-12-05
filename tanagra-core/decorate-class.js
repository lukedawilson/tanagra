module.exports = function(clazz, serializationKey, nestedClazzes) {
  clazz._fieldTypes = nestedClazzes && new Map(nestedClazzes.map(klass => [klass._serializationKey, klass]))

  return class extends clazz {
    constructor() {
      super(...arguments)
      this._serializationKey = serializationKey
    }

    static get _serializationKey() {
      return serializationKey
    }
  }
}
