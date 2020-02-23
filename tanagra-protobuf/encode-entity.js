const primitiveTypes = require('./primitive-types')
const generateMessage = require('./generate-message')

function encodeEntity(value) {
  if (!value || !value.constructor || primitiveTypes[value.constructor.name]) {
    throw new Error(`Type is not serializable: ${(value && value.constructor && value.constructor.name) || 'Object'}`)
  }

  const message = generateMessage(value)
  const encoded = message.encode(value).finish()
  const schema = global.protobuf.Type.encode(message.toJSON()).finish()
  return { encoded, type: message.name, schema }
}

/**
 * Serializes a decorated class instance as a Google protobuffers binary object.
 *
 * @function encodeEntity
 * @param instance A decorated class instance.
 *
 * @returns Object Tuple (binary encoding, class name, protobuf schema).
 * @example
 * const protobuf = require('tanagra-protobuf')
 * protobuf.init()
 *
 * const foo = new SomeDecoratedClass()
 * const serialized = protobuf.encodeEntity(foo)
 */
module.exports = encodeEntity
