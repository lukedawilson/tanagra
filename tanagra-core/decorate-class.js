module.exports = function(clazz, nestedClazzes, customSerializationKey) {
  clazz._fieldTypes = nestedClazzes && new Map(nestedClazzes.map(klass => [klass._serializationKey, klass]))
  const serializationKey = customSerializationKey || clazz.name

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
