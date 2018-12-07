module.exports = function(clazz, nestedClazzes, customSerializationKey) {
  clazz._fieldTypes = nestedClazzes && new Map(nestedClazzes.map(klass => [klass._serializationKey, klass]))

  const serializationKey = customSerializationKey || clazz.name
  const getterDescriptor = {
    get: function _serializationKey() { return serializationKey },
    configurable: true
  }

  Object.defineProperty(clazz, '_serializationKey', getterDescriptor)

  const ctorHandler = {
    construct (target, args) {
      const instance = new target(...args)
      instance._serializationKey = serializationKey
      return instance
    }
  }

  return new Proxy(clazz, ctorHandler)
}
