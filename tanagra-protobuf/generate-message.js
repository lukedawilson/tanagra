const protobuf = require('protobufjs')
const memcache = require('memory-cache')

const primitiveTypes = require('./primitive-types')
const KeyValuePair = require('./key-value-pair')
const getTypeId = require('./get-type-id')

function generateMessage(instance) {
  let message
  if (instance.constructor.name === 'Object') {
    message = new protobuf.Type(`Object_${getObjectIndex()}`)
  } else {
    message = new protobuf.Type(instance.constructor.name)
    message.add(new protobuf.Field('_serializationKey', 999, 'string'))
  }

  let i = 0
  const fields = Object.entries(instance)
  for (const field of fields) {
    const name = field[0], value = field[1], type = value.constructor.name
    if (name === '_serializationKey') continue

    i = addProtoField(message, name, value, i, type)
  }

  return message
}

function addProtoField(message, name, value, i, type, rule = undefined) {
  if (primitiveTypes[type]) {
    message.add(new protobuf.Field(name, i++, primitiveTypes[type], rule))
  } else if ((type === 'Array' || type === 'Map') && rule) {
    // Do nothing - we don't support applying rules to arrays or maps (e.g. arrays of arrays, arrays of maps, etc.)
  } else if (type === 'Array') {
    const childValue = value[0], childType = childValue.constructor.name
    if (childValue) {
      i = addProtoField(message, name, childValue, i, childType, 'repeated')
    }
  } else if (type === 'Map') {
    const childKey = value.keys().next().value, childValue = childKey && value.get(childKey)
    if (childValue) {
      const kvp = new KeyValuePair(childKey, childValue)
      const childMessage = getOrGenerateMessage(kvp)
      if (!message.get(childMessage.name)) message.add(childMessage)
      message.add(new protobuf.Field(`${name}_map`, i++, childMessage.name, 'repeated'))
    }
  } else {
    const subMessage = getOrGenerateMessage(value)
    if (!message.get(subMessage.name)) message.add(subMessage)
    message.add(new protobuf.Field(name, i++, subMessage.name, rule))
  }

  return i
}

function addNormalisedMapsToInstance(instance) {
  const fields = Object.entries(instance)
  for (const field of fields) {
    const name = field[0], value = field[1], type = value.constructor.name
    if (type === 'Array') {
      value.forEach(addNormalisedMapsToInstance)
    } else if (type === 'Map') {
      instance[`${name}_map`] = Array.from(value.keys()).map(k => {
        const v = value.get(k)
        return new KeyValuePair(k, v)
      })

      Array.from(value.values()).forEach(addNormalisedMapsToInstance)
    } else if (!primitiveTypes[type]) { // type !== 'Object'
      addNormalisedMapsToInstance(value)
    }
  }
}

function getObjectIndex() {
  const objIndex = memcache.get('object-index') || 0
  memcache.put('object-index', objIndex + 1)
  return objIndex
}

function getOrGenerateMessage(instance) {
  const typeId = getTypeId(instance)
  const existing = typeId && memcache.get(typeId)
  if (existing) {
    return existing
  }

  const newMessage = generateMessage(instance)
  memcache.put(typeId, newMessage)
  return newMessage
}

module.exports = instance => {
  const message = getOrGenerateMessage(instance)
  addNormalisedMapsToInstance(instance)
  return message
}
