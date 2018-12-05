function denormalizeJsonObject(instance) {
  if (instance._serializationKey) {
    const proto = global.serializable.get(instance._serializationKey)
    if (proto) {
      Object.setPrototypeOf(instance, proto)
    }
  }

  Object.entries(instance).map(entry => ({ key: entry[0], value: entry[1] })).filter(kvp => kvp.value).forEach(kvp => {
    if (kvp.key.indexOf('_map') !== -1) {
      instance[kvp.key.replace('_map', '')] = new Map(kvp.value)
      instance[kvp.key].map(kvp => kvp[1]).forEach(denormalizeJsonObject)
      delete instance[kvp.key]
    } else if (kvp.value._serializationKey) {
      denormalizeJsonObject(kvp.value)
    } else if (kvp.value.constructor.name === 'Array') {
      kvp.value.forEach(denormalizeJsonObject)
    }
  })
}

function addSerializableClasses(clazz, map) {
  if (clazz._serializationKey) {
    map.set(clazz._serializationKey, clazz.prototype)
  }

  if (clazz._fieldTypes) {
    clazz._fieldTypes.forEach(klass => addSerializableClasses(klass, map))
  }
}

module.exports = function(encoded, clazz) {
  const decoded = JSON.parse(encoded)

  if (clazz) {
    addSerializableClasses(clazz, global.serializable)
  }

  denormalizeJsonObject(decoded)
  return decoded
}
