function normalizeJsonObject(instance) {
  Object.entries(instance).map(entry => ({ key: entry[0], value: entry[1] })).forEach(kvp => {
    if (kvp.value._serializationKey) {
      normalizeJsonObject(kvp.value)
    } else if (kvp.value.constructor.name === 'Map') {
      instance[`${kvp.key}_map`] = [...kvp.value]
    }
  })
}

module.exports = function(entity) {
  normalizeJsonObject(entity)
  return JSON.stringify(entity)
}
