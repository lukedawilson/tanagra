const protobuf = require('protobufjs')

function decodeEntity(tuple) {
  const entity = new Buffer(tuple.encoded.data || tuple.encoded)
  const type = tuple.type
  const fields = tuple.fields

  const MyType = new protobuf.Type(type)
  fields.forEach(field => {
    MyType.add(new protobuf.Field(field.name, field.id, field.type))
  })

  const decoded = MyType.decode(entity)
  Object.entries(decoded).forEach(entry => {
    const kvp = { key: entry[0], value: entry[1] }
    if (!kvp.value) return

    if (kvp.key.indexOf('_encoded') !== -1) {
      const key = kvp.key.replace('_encoded', '')
      const type = decoded[`${key}_type`]
      const fields = JSON.parse(decoded[`${key}_fields`])
      decoded[key] = decodeEntity({ encoded: kvp.value, type, fields })

      delete decoded[kvp.key]
      delete decoded[`${key}_type`]
      delete decoded[`${key}_fields`]
    } else if (kvp.key.indexOf('_array') !== -1) {
      const key = kvp.key.replace('_array', '')
      const array = JSON.parse(kvp.value)

      decoded[key] = array.map(decodeEntity)

      delete decoded[kvp.key]
    } else if (kvp.key.indexOf('_date') !== -1) {
      const key = kvp.key.replace('_date', '')

      decoded[key] = new Date(kvp.value * 1000)

      delete decoded[kvp.key]
    }
  })

  return decoded
}

module.exports = decodeEntity
