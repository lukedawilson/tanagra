const primitiveTypes = require('./primitive-types')
const generateMessage = require('./generate-message')

function encodeEntity(value) {
  if (!value || !value.constructor || primitiveTypes[value.constructor.name]) {
    throw new Error(`Type is not serializable: ${(value && value.constructor && value.constructor.name) || 'Object'}`)
  }

  const message = generateMessage(value)
  const encoded = message.encode(value).finish()
  return { encoded, type: message.name, filePath: value.filePath, message: JSON.stringify(message.toJSON()) }
}

module.exports = encodeEntity
