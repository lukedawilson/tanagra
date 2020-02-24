function normalizeJsonObject(instance) {
  if (instance === null || instance === undefined) return

  Object.entries(instance).map(entry => ({ key: entry[0], value: entry[1] })).filter(kvp => kvp.value).forEach(kvp => {
    if (kvp.value.constructor.name === 'Array') {
      kvp.value.forEach(normalizeJsonObject)
    } else if (kvp.value.constructor._serializationKey) {
      normalizeJsonObject(kvp.value)
    } else if (kvp.value.constructor.name === 'Map') {
      const array = [...kvp.value]
      instance[`${kvp.key}_map`] = array
      array.map(subArray => subArray[1]).forEach(normalizeJsonObject)
    } else if (kvp.value.constructor.name === 'Date') {
      instance[`${kvp.key}_date`] = kvp.value
    }
  })
}

/**
 * Serializes a decorated class instance as a JSON string.
 *
 * @memberOf module:tanagra-json
 * @function encodeEntity
 * @param instance A decorated class instance.
 *
 * @returns String JSON encoding of the instance.
 * @example
 * const json = require('tanagra-json')
 * const foo = new SomeDecoratedClass()
 * const serialized = json.encodeEntity(foo)
 */
module.exports = function(instance) {
  normalizeJsonObject(instance)
  return JSON.stringify(instance)
}
