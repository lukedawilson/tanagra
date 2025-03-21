function normalizeJsonObject(instance) {
  if (instance === null || instance === undefined) {
    return
  }

  instance._serializationKey = instance.constructor._serializationKey

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
    } else if (kvp.value.constructor.name === 'Buffer') {
      instance[`${kvp.key}_buffer`] = kvp.value
    } else if (kvp.value.constructor.name === 'Uint8Array') {
      instance[`${kvp.key}_uint8array`] = kvp.value
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
 *
 * @example <caption>Javascript</caption>
 *
 * const encodeEntity = require('tanagra-json').encodeEntity
 *
 * const foo = new Foo()
 * const serialized = encodeEntity(foo)
 *
 * @example <caption>Typescript</caption>
 *
 * import { encodeEntity } from 'tanagra-json'
 *
 * const foo: Foo = new Foo()
 * const serialized: string = encodeEntity(foo)
 */
module.exports = function(instance) {
  normalizeJsonObject(instance)
  return JSON.stringify(instance)
}
