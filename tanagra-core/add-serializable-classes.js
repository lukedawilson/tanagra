const serializableClassMappings = require('./serializable-class-mappings').get

module.exports = function addSerializableClasses(clazz) {
  if (clazz._serializationKey) {
    serializableClassMappings().set(clazz._serializationKey, clazz.prototype)
  }

  if (clazz._fieldTypes) {
    clazz._fieldTypes.forEach(addSerializableClasses)
  }
}
