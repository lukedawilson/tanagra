const protobuf = require('protobufjs')

const primitiveTypes = require('./primitive-types')

module.exports = function(instance, typeMap = null) {
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
      typeMap.add(new protobuf.Field(`${kvp.key}_array`, i++, 'string'))
    } else if (kvp.value.constructor.name === 'Date') {
      typeMap.add(new protobuf.Field(`${kvp.key}_date`, i++, 'int32'))
    } else if (!primitiveTypes[kvp.value.constructor.name]) {
      typeMap.add(new protobuf.Field(`${kvp.key}_encoded`, i++, 'bytes'))
      typeMap.add(new protobuf.Field(`${kvp.key}_type`, i++, 'string'))
      typeMap.add(new protobuf.Field(`${kvp.key}_fields`, i++, 'string'))
    } else {
      typeMap.add(new protobuf.Field(kvp.key, i++, primitiveTypes[kvp.value.constructor.name]))
    }
  })

  return typeMap
}
