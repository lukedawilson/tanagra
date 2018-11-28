const protobuf = require('protobufjs')

const primitiveTypes = require('./primitive-types')

const typeMapCache = new Map() // ToDo: use memcache or redis (or both)

function generateTypeMap(instance, typeMap) {
  if (!typeMap) {
    typeMap = new protobuf.Type(instance.constructor.name)
  }

  const alreadyMappedFields = Object.keys(typeMap.fields).map(f => f.split('_')[0]) // ToDo: replace this logic with something that smells less like my dog
  const fieldsToMap = Object.entries(instance)
    .map(entry => ({ key: entry[0], value: entry[1] }))
    .filter(kvp => kvp.value && alreadyMappedFields.indexOf(kvp.key) === -1)

  let i = 0
  fieldsToMap.forEach(kvp => {
    if (kvp.value.constructor.name === 'Array') {
      const firstChild = kvp.value[0]
      if (firstChild) {
        const childType = getSet(firstChild) // assume all children of same type
        typeMap.add(childType)
        typeMap.add(new protobuf.Field(`${kvp.key}`, i++, childType.name, 'repeated'))
      }
    } else if (kvp.value.constructor.name === 'Date') {
      typeMap.add(new protobuf.Field(`${kvp.key}`, i++, 'double', undefined, undefined, { isDate: true }))
    } else if (!primitiveTypes[kvp.value.constructor.name]) {
      const subtypeMap = getSet(kvp.value)
      typeMap.add(subtypeMap)
      typeMap.add(new protobuf.Field(`${kvp.key}`, i++, subtypeMap.name))
    } else {
      typeMap.add(new protobuf.Field(kvp.key, i++, primitiveTypes[kvp.value.constructor.name]))
    }
  })

  return typeMap
}

function getTypeId(value) {
  return value.filePath ? value.filePath : value.constructor.name
}

function getSet(value) {
  let typeMap = generateTypeMap(value, typeMapCache.get(getTypeId(value)))
  if (!typeMapCache.has(getTypeId(value))) {
    typeMapCache.set(getTypeId(value), typeMap)
  }

  return typeMap
}

module.exports = getSet
