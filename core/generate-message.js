const protobuf = require('protobufjs')
const messageCache = require('memory-cache')

const KeyValuePair = require('./key-value-pair')
const primitiveTypes = require('./primitive-types')

function generateMessage(instance, message) {
  if (!message) {
    message = new protobuf.Type(instance.constructor.name)
  }

  const alreadyMappedFields = Object.keys(message.fields)
  const fieldsToMap = Object.entries(instance)
    .map(entry => ({ key: entry[0], value: entry[1] }))
    .filter(kvp => kvp.value && alreadyMappedFields.indexOf(kvp.key) === -1)

  let i = 0
  fieldsToMap.forEach(kvp => {
    if (kvp.value.constructor.name === 'Array') {
      const firstChild = kvp.value[0]
      if (firstChild) {
        const childMessage = getSet(firstChild) // assume all children of same type
        message.add(childMessage)
        message.add(new protobuf.Field(kvp.key, i++, childMessage.name, 'repeated'))
      }
    } else if (kvp.value.constructor.name === 'Map') {
      const firstKey = kvp.value.keys().next().value
      if (firstKey) {
        const firstValue = kvp.value.get(firstKey)
        if (firstValue) {
          if (alreadyMappedFields.indexOf(`${kvp.key}_map`) === -1) {
            const childValue = new KeyValuePair(firstKey, firstValue, firstKey._serializationKey, firstValue._serializationKey)
            const childMessage = getSet(childValue)
            message.add(childMessage)
            message.add(new protobuf.Field(`${kvp.key}_map`, i++, childMessage.name, 'repeated'))
          }

          instance[`${kvp.key}_map`] = Array.from(kvp.value.keys()).map(key => {
            const value = kvp.value.get(key)
            return new KeyValuePair(key, value, key._serializationKey, value._serializationKey)
          })
        }
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

function getTypeId(value) {
  return value.serializable ? value._serializationKey : value.constructor.name
}

function getSet(value) {
  const messageFromCache = messageCache.get(getTypeId(value))
  const message = generateMessage(value, messageFromCache)
  if (!messageFromCache) {
    messageCache.put(getTypeId(value), message)
  }

  return message
}

module.exports = getSet
