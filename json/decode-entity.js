function denormalizeJsonObject(instance) {
  if (instance._serializationKey) {
    const proto = global.serializable.get(instance._serializationKey)
    Object.setPrototypeOf(instance, proto)
  }

  Object.entries(instance).map(entry => ({ key: entry[0], value: entry[1] })).forEach(kvp => {
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

module.exports = function(encoded) {
  const decoded = JSON.parse(encoded)
  denormalizeJsonObject(decoded)
  return decoded
}
