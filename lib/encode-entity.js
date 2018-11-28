const primitiveTypes = require('./primitive-types')
const generateTypeMap = require('./generate-type-map')

function encodeEntity(value) {
  if (!value || !value.constructor || primitiveTypes[value.constructor.name]) {
    throw new Error(`Type is not serializable: ${(value && value.constructor && value.constructor.name) || 'Object'}`)
  }

  const typeMap = generateTypeMap(value)
  const specialFields = {}

  Object.entries(value).forEach(entry => {
    const kvp = { key: entry[0], value: entry[1] }
    if (!kvp.value) return

    if (kvp.value.constructor.name === 'Array') {
      const array = kvp.value.map(encodeEntity)
      specialFields[`${kvp.key}_array`] = JSON.stringify(array)
    } else if (kvp.value.constructor.name === 'Date') {
      specialFields[`${kvp.key}_date`] = kvp.value.getTime() / 1000
    }
  })

  const encoded = typeMap.encode(value).finish()
  const specialFieldsEncoded = typeMap.encode(specialFields).finish()
  return { encoded, specialFieldsEncoded, type: typeMap.name, filePath: value.filePath, typeMap: JSON.stringify(typeMap.toJSON()) }
}

module.exports = encodeEntity
