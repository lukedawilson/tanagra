const primitiveTypes = require('./primitive-types')
const generateTypeMap = require('./generate-type-map')

function encodeEntity(value) {
  if (!value || !value.constructor || primitiveTypes[value.constructor.name]) {
    throw new Error(`Type is not serializable: ${(value && value.constructor && value.constructor.name) || 'Object'}`)
  }

  const typeMap = generateTypeMap(value)
  const encoded = typeMap.encode(value).finish()
  return { encoded, type: typeMap.name, filePath: value.filePath, typeMap: JSON.stringify(typeMap.toJSON()) }
}

module.exports = encodeEntity
