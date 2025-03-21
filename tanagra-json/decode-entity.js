const serializableClassMappings = require('tanagra-core').serializableClassMappings.get

function denormalizeJsonObject(instance) {
  if (instance === null || instance === undefined) return

  if (instance._serializationKey) {
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
    } else if (kvp.key.indexOf('_buffer') !== -1) {
      instance[kvp.key.replace('_buffer', '')] = Buffer.from(kvp.value.data)
      delete instance[kvp.key]
    } else if (kvp.key.indexOf('_uint8array') !== -1) {
      instance[kvp.key.replace('_uint8array', '')] = objectToUint8Array(kvp.value)
      delete instance[kvp.key]
    } else if (kvp.value._serializationKey) {
      denormalizeJsonObject(kvp.value)
    } else if (kvp.value.constructor.name === 'Array') {
      kvp.value.forEach(denormalizeJsonObject)
    }
  })
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
