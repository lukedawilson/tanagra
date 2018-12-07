function normalizeJsonObject(instance) {
  Object.entries(instance).map(entry => ({ key: entry[0], value: entry[1] })).filter(kvp => kvp.value).forEach(kvp => {
    if (kvp.value.constructor.name === 'Array') {
      kvp.value.forEach(normalizeJsonObject)
    } else if (kvp.value.constructor._serializationKey) {
      normalizeJsonObject(kvp.value)
    } else if (kvp.value.constructor.name === 'Map') {
      const array = [...kvp.value]
      instance[`${kvp.key}_map`] = array
      array.map(subArray => subArray[1]).forEach(normalizeJsonObject)
    }
  })
}

module.exports = function(instance) {
  normalizeJsonObject(instance)
  return JSON.stringify(instance)
}
