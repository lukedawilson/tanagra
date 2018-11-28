const protobuf = require('protobufjs')

const primitiveTypes = require('./primitive-types')

const messageCache = new Map() // ToDo: use memcache or redis (or both)

function generateMessage(instance, message) {
  if (!message) {
    message = new protobuf.Type(instance.constructor.name)
  }

  const alreadyMappedFields = Object.keys(message.fields).map(f => f.split('_')[0]) // ToDo: replace this logic with something that smells less like my dog
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
        message.add(new protobuf.Field(`${kvp.key}`, i++, childMessage.name, 'repeated'))
      }
    } else if (kvp.value.constructor.name === 'Date') {
      message.add(new protobuf.Field(`${kvp.key}`, i++, 'double', undefined, undefined, { isDate: true }))
    } else if (!primitiveTypes[kvp.value.constructor.name]) {
      const subMessage = getSet(kvp.value)
      message.add(subMessage)
      message.add(new protobuf.Field(`${kvp.key}`, i++, subMessage.name))
    } else {
      message.add(new protobuf.Field(kvp.key, i++, primitiveTypes[kvp.value.constructor.name]))
    }
  })

  return message
}

function getTypeId(value) {
  return value.filePath ? value.filePath : value.constructor.name
}

function getSet(value) {
  let message = generateMessage(value, messageCache.get(getTypeId(value)))
  if (!messageCache.has(getTypeId(value))) {
    messageCache.set(getTypeId(value), message)
  }

  return message
}

module.exports = getSet
