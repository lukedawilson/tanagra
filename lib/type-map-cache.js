const generateTypeMap = require('./generate-type-map')

const typeMapCache = new Map() // ToDo: use memcache or redis (or both)

function getTypeId(value) {
  return value.uniqueIdentifier ? value.uniqueIdentifier : value.constructor.name
}

module.exports = function(value) {
  let typeMap = generateTypeMap(value, typeMapCache.get(getTypeId(value)))
  if (!typeMapCache.has(getTypeId(value))) {
    typeMapCache.set(getTypeId(value), typeMap)
  }

  return typeMap
}
