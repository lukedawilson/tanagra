const protobuf = require('protobufjs')

const addSerializableClasses = require('tanagra-core').addSerializableClasses
const serializableClassMappings = require('tanagra-core').serializableClassMappings.get

const CustomReader = require('./custom-reader')

function deserializeMap(mapFieldName, result, serializable) {
  const map = new Map()
  result[mapFieldName].forEach(kvp => {
    // Set prototypes on kvp's key and value
    if (kvp._keySerializationKey) {
      const proto = serializable.get(kvp._keySerializationKey)
      if (proto) {
        Object.setPrototypeOf(kvp.key, proto)
      }
    }

    if (kvp._valueSerializationKey) {
      const proto = serializable.get(kvp._valueSerializationKey)
      if (proto) {
        Object.setPrototypeOf(kvp.value, proto)
      }
    }

    // Add entry to map
    map.set(kvp.key, kvp.value)
  })

  const originalKey = mapFieldName.replace('_map', '')
  result[originalKey] = map

  delete result[mapFieldName]

  return map
}

function denormaliseInstance(instance, serializable) {
  if (instance._serializationKey) {
    const proto = serializable.get(instance._serializationKey)
    if (proto) {
      Object.setPrototypeOf(instance, proto)
    }
  }

  Object.entries(instance).map(entry => ({ key: entry[0], value: entry[1] })).filter(kvp => kvp.value).forEach(kvp => {
    if (kvp.key.indexOf('_map') !== -1) {
      const map = deserializeMap(kvp.key, instance, serializable)
      Array.from(map.values()).forEach(v => denormaliseInstance(v, serializable))
    } else if (kvp.value.constructor.name === 'Array') {
      kvp.value.forEach(v => denormaliseInstance(v, serializable))
    } else if (kvp.value._serializationKey) {
      denormaliseInstance(kvp.value, serializable)
    }
  })
}

function decodeEntity(tuple, clazz) {
  const entity = new Buffer(tuple.encoded || [])
  const json = global.protobuf.Type.decode(tuple.schema)
  const message = protobuf.Type.fromJSON(tuple.type, json)
  const instance = message.decode(new CustomReader(entity))

  if (clazz) {
    addSerializableClasses(clazz)
  }

  denormaliseInstance(instance, serializableClassMappings())
  return instance
}

/**
 * Deserializes a class instance that was serialized in Google protobuffers format.
 *
 * @memberOf module:tanagra-protobuf
 * @function decodeEntity
 * @param encoded Serialized instance, with class metadata.
 * @param clazz Type parameter specifying class to deserialize to.
 *
 * @returns Object Deserialized instance of specified type.
 * @example
 * const protobuf = require('tanagra-protobuf')
 * protobuf.init()
 * const foo = protobuf.decodeEntity(tuple)
 */
module.exports = decodeEntity
