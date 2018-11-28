const protobuf = require('protobufjs')

function decodeEntity(tuple) {
  const entity = new Buffer(tuple.encoded || [])
  const specialFields = new Buffer(tuple.specialFieldsEncoded || [])

  const type = tuple.type
  const filePath = tuple.filePath

  // Build type map
  const typeMap = protobuf.Type.fromJSON(type, JSON.parse(tuple.typeMap))

  // Add data
  const decoded = typeMap.decode(entity)

  const decodedSpecialFields = typeMap.decode(specialFields)
  const nonNullSpecialFields = Object.entries(decodedSpecialFields)
    .map(entry => ({ key: entry[0], value: entry[1] }))
    .filter(kvp => kvp.value)

  nonNullSpecialFields.forEach(kvp => {
    if (kvp.key.indexOf('_array') !== -1) {
      const key = kvp.key.replace('_array', '')
      const array = JSON.parse(kvp.value)

      decoded[key] = array.map(decodeEntity)
    } else if (kvp.key.indexOf('_date') !== -1) {
      const key = kvp.key.replace('_date', '')

      decoded[key] = new Date(kvp.value * 1000)
    }
  })

  // Add functions
  if (filePath) {
    Object.setPrototypeOf(decoded, require(filePath).prototype)
  }

  return decoded
}

module.exports = decodeEntity
