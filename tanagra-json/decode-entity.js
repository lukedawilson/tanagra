const serializableClassMappings = require('tanagra-core').serializableClassMappings.get
const addSerializableClasses = require('tanagra-core').addSerializableClasses

function denormalizeJsonObject(instance) {
  if (instance === null || instance === undefined) return

  if (instance._serializationKey) { // ToDo: no need to look it up, pass in clazz and use clazz.prototype
    const proto = serializableClassMappings().get(instance._serializationKey)
    if (proto) {
      Object.setPrototypeOf(instance, proto)
    }
  }

  Object.entries(instance).map(entry => ({ key: entry[0], value: entry[1] })).filter(kvp => kvp.value).forEach(kvp => {
    if (kvp.key.indexOf('_map') !== -1) {
      instance[kvp.key.replace('_map', '')] = new Map(kvp.value)
      instance[kvp.key].map(kvp => kvp[1]).forEach(denormalizeJsonObject)
      delete instance[kvp.key]
    } else if (kvp.key.indexOf('_date') !== -1) {
      instance[kvp.key.replace('_date', '')] = new Date(kvp.value)
      delete instance[kvp.key]
    } else if (kvp.value._serializationKey) {
      denormalizeJsonObject(kvp.value)
    } else if (kvp.value.constructor.name === 'Array') {
      kvp.value.forEach(denormalizeJsonObject)
    }
  })
}

/**
 * Deserializes a class instance that was serialized in JSON format.
 *
 * @memberOf module:tanagra-json
 * @function decodeEntity
 * @param encoded Serialized instance, with class metadata.
 * @param clazz Type parameter specifying class to deserialize to.
 *
 * @returns Object Deserialized instance of specified type.
 * @example
 * const json = require('tanagra-json')
 * const foo = json.decodeEntity(someSerializedJsonString, SomeDecoratedClass)
 */
module.exports = function(encoded, clazz) {
  const decoded = JSON.parse(encoded)

  if (clazz) {
    addSerializableClasses(clazz) // ToDo: do we need this at all?
  }

  denormalizeJsonObject(decoded) // ToDo: pass in clazz here
  return decoded
}
