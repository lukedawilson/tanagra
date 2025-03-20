const primitiveTypes = require('./primitive-types')
const generateMessage = require('./generate-message')

function encodeEntity(instance) {
  if (!instance || !instance.constructor || primitiveTypes[instance.constructor.name]) {
    throw new Error(`Type is not serializable: ${(instance && instance.constructor && instance.constructor.name) || 'Object'}`)
  }

  const message = generateMessage(instance)
  const encoded = message.encode(instance).finish()
  const schema = global.protobuf.Type.encode(message.toJSON()).finish()
  return { encoded, type: message.name, schema }
}

/**
 * Serializes a decorated class instance as a Google protobuffers binary object.
 *
 * @memberOf module:tanagra-protobuf
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
