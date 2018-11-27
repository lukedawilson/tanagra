const primitiveTypes = require('./primitive-types')
const getSetTypeMap = require('./type-map-cache')

function encodeEntity(value) {
  if (!value || !value.constructor || primitiveTypes[value.constructor.name]) {
    throw new Error(`Type is not serializable: ${(value && value.constructor && value.constructor.name) || 'Object'}`)
  }

  const typeMap = getSetTypeMap(value)
  const specialFields = {}

  Object.entries(value).forEach(entry => {
    const kvp = { key: entry[0], value: entry[1] }
    if (!kvp.value) return

    if (kvp.value.constructor.name === 'Array') {
      const array = kvp.value.map(encodeEntity)
      specialFields[`${kvp.key}_array`] = JSON.stringify(array)
    } else if (kvp.value.constructor.name === 'Date') {
      specialFields[`${kvp.key}_date`] = kvp.value.getTime() / 1000
    } else if (!primitiveTypes[kvp.value.constructor.name]) {
      const tuple = encodeEntity(kvp.value)
      specialFields[`${kvp.key}_encoded`] = tuple.encoded
      specialFields[`${kvp.key}_type`] = tuple.type
      specialFields[`${kvp.key}_fields`] = JSON.stringify(tuple.fields)
    }
  })

  const encoded = typeMap.encode(value).finish()
  const specialFieldsEncoded = typeMap.encode(specialFields).finish()
  const fields = Object.entries(typeMap.fields).map(kvp => { return { name: kvp[0], id: kvp[1].id, type: kvp[1].type } })
  return { encoded, specialFieldsEncoded, type: typeMap.name, filePath: value.filePath, fields }
}

module.exports = encodeEntity
