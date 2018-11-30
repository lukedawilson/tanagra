const primitiveTypes = require('./primitive-types')
const generateMessage = require('./generate-message')

function encodeEntity(value) {
  if (!value || !value.constructor || primitiveTypes[value.constructor.name]) {
    throw new Error(`Type is not serializable: ${(value && value.constructor && value.constructor.name) || 'Object'}`)
  }

  const message = generateMessage(value)
  const encoded = message.encode(value).finish()
  const schema = global.protobuf.Type.encode(message.toJSON()).finish()
  return { encoded, type: message.name, filePath: value.filePath, schema }
}

module.exports = encodeEntity
