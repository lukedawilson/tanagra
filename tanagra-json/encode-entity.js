function decorate(instance) {
  // instance is null, undefined or a primitive
  if (instance === null || instance === undefined || instance !== Object(instance)) {
    return instance
  }

  const decorated = {};
  decorated._serializationKey = instance.constructor._serializationKey

  const entries = Object.entries(instance)
    .map(entry => ({ key: entry[0], value: entry[1] }))
    .filter(kvp => kvp.value);

  for (const kvp of entries) {
    if (kvp.value.constructor.name === 'Array') {
      decorated[kvp.key] = kvp.value.map(decorate)
    } else if (kvp.value.constructor._serializationKey) {
      decorated[kvp.key] = decorate(kvp.value)
    } else if (kvp.value.constructor.name === 'Map') {
      const array = [...kvp.value]
      decorated[`${kvp.key}_map`] = array.map(kvp => [kvp[0], decorate(kvp[1])])
    } else if (kvp.value.constructor.name === 'Date') {
      decorated[`${kvp.key}_date`] = kvp.value
    } else if (kvp.value.constructor.name === 'Buffer') {
      decorated[`${kvp.key}_buffer`] = kvp.value
    } else if (kvp.value.constructor.name === 'Uint8Array') {
      decorated[`${kvp.key}_uint8array`] = kvp.value
    } else {
      decorated[kvp.key] = kvp.value
    }
  }

  return decorated;
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
  const decorated = decorate(instance)
  return JSON.stringify(decorated)
}
