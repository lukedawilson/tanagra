const protobuf = require('protobufjs')
const memcache = require('memory-cache')

const KeyValuePair = require('./key-value-pair')
const primitiveTypes = require('./primitive-types')

function generateMessage(instance, message) {
  if (!message) {
    if (instance.constructor.name === 'Object') {
      message = new protobuf.Type(`Object_${getObjectIndex()}`)
    } else {
      message = new protobuf.Type(instance.constructor.name)
      message.add(new protobuf.Field('_serializationKey', 999, 'string'))
    }
  }

  const alreadyMappedFields = Object.keys(message.fields)
  const fieldsToMap = Object.entries(instance)
    .map(entry => ({ key: entry[0], value: entry[1] }))
    .filter(kvp => kvp.value && alreadyMappedFields.indexOf(kvp.key) === -1)

  let i = alreadyMappedFields.length
  fieldsToMap.forEach(kvp => {
    if (kvp.value.constructor.name === 'Array') {
      const firstChild = kvp.value[0]
      if (firstChild) {
        if (!primitiveTypes[firstChild.constructor.name]) {
          const childMessage = getSet(firstChild) // assume all children of same type
          message.add(childMessage)
          message.add(new protobuf.Field(kvp.key, i++, childMessage.name, 'repeated'))
        } else {
          message.add(new protobuf.Field(kvp.key, i++, primitiveTypes[firstChild.constructor.name], 'repeated'))
        }
      }
    } else if (kvp.value.constructor.name === 'Map') {
      const firstKey = kvp.value.keys().next().value
      const firstValue = firstKey && kvp.value.get(firstKey)
      if (firstValue) {
        // If KeyValuePair repeated field not already added, add it
        if (alreadyMappedFields.indexOf(`${kvp.key}_map`) === -1) {
          const childValue = new KeyValuePair(firstKey, firstValue, firstKey._serializationKey, firstValue._serializationKey)
          const childMessage = getSet(childValue)
          message.add(childMessage)
          message.add(new protobuf.Field(`${kvp.key}_map`, i++, childMessage.name, 'repeated'))
        }

        // Add internal representation of map to instance being serialized
        instance[`${kvp.key}_map`] = Array.from(kvp.value.keys()).map(key => {
          const value = kvp.value.get(key)
          return new KeyValuePair(key, value, key._serializationKey, value._serializationKey)
        })
      }
    } else if (!primitiveTypes[kvp.value.constructor.name]) {
      const subMessage = getSet(kvp.value)
      message.add(subMessage)
      message.add(new protobuf.Field(kvp.key, i++, subMessage.name))
    } else {
      message.add(new protobuf.Field(kvp.key, i++, primitiveTypes[kvp.value.constructor.name]))
    }
  })

  return message
}

// ToDo: this could be a GUID, or else overflow errors could occur for large numbers of object instances
function getObjectIndex() {
  const objIndex = memcache.get('object-index') || 0
  memcache.put('object-index', objIndex + 1)
  return objIndex
}

function getTypeId(value) {
  return value.constructor.name === 'Object'
    ? `Object_${getObjectIndex()}`
    : (value._serializationKey || value.constructor.name)
}

function getSet(value) {
  const messageFromCache = memcache.get(getTypeId(value))
  const message = generateMessage(value, messageFromCache)
  if (!messageFromCache) {
    memcache.put(getTypeId(value), message)
  }

  return message
}

module.exports = getSet
