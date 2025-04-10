const serializableClassMappings = require('tanagra-core').serializableClassMappings.get

function denormalizeJsonObject(instance) {
  if (instance === null || instance === undefined) {
    return instance
  }

  if (instance._serializationKey) {
    const proto = serializableClassMappings().get(instance._serializationKey)
    if (proto) {
      Object.setPrototypeOf(instance, proto)
    }
  }

  const entries = Object.entries(instance)
    .map(entry => ({ key: entry[0], value: entry[1] }))
    .filter(kvp => kvp.value)

  for (const kvp of entries) {
    if (kvp.key.endsWith('$Map')) {
      instance[stripSuffix(kvp.key, '$Map')] = new Map(kvp.value)
      instance[kvp.key].map(kvp => kvp[1]).forEach(denormalizeJsonObject)
      delete instance[kvp.key]
    } else if (kvp.key.endsWith('$Date')) {
      instance[stripSuffix(kvp.key, '$Date')] = new Date(kvp.value)
      delete instance[kvp.key]
    } else if (kvp.key.endsWith('$Buffer') ) {
      instance[stripSuffix(kvp.key, '$Buffer')] = Buffer.from(kvp.value.data)
      delete instance[kvp.key]
    } else if (kvp.key.endsWith('$Uint8Array')) {
      instance[stripSuffix(kvp.key, '$Uint8Array')] = objectToUint8Array(kvp.value)
      delete instance[kvp.key]
    } else if (kvp.value._serializationKey) {
      denormalizeJsonObject(kvp.value)
    } else if (kvp.value.constructor.name === 'Array') {
      kvp.value.forEach(denormalizeJsonObject)
    }
  }
}

function stripSuffix(str, suffix) {
  return str.slice(0, str.length - suffix.length);
}

function objectToUint8Array(obj) {
  const length = Math.max(...Object.keys(obj).map(key => parseInt(key))) + 1;
  const uint8Array = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    if (obj[i] !== undefined) {
      uint8Array[i] = obj[i];
    }
  }

  return uint8Array;
}

/**
 * Deserializes a class instance that was serialized in JSON format.
 *
 * @memberOf module:tanagra-json
 * @function decodeEntity
 * @param encoded Serialized instance, with class metadata.
 *
 * @returns Object Deserialized instance of specified type.
 *
 * @example <caption>Javascript</caption>
 *
 * const decodeEntity = require('tanagra-json').decodeEntity
 *
 * const foo = decodeEntity(someSerializedJsonString)
 *
 * @example <caption>Typescript</caption>
 *
 * import { decodeEntity } from 'tanagra-json'
 *
 * const foo: Foo = decodeEntity<Foo>(someSerializedJsonString)
 */
module.exports = function(encoded) {
  const decoded = JSON.parse(encoded)
  denormalizeJsonObject(decoded)
  return decoded
}
