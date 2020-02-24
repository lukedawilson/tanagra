/**
 * Gets a unique identifier for the type of a given decorated class instance.
 *
 * @package
 * @memberOf module:tanagra-protobuf
 * @function getTypeId
 * @param instance Instance of a class decorated with serialization metadata.
 * @returns {String}
 */
module.exports = instance => {
  if (instance === null || instance === undefined) {
    throw new Error('Instance must not be null or undefined')
  }

  switch (instance.constructor.name) {
    case 'Object':
      return `Object_${Object.keys(instance).join('')}`
    case 'KeyValuePair':
      return `KeyValuePair_${instance._keySerializationKey}${instance._valueSerializationKey}`
    default:
      return instance._serializationKey || instance.constructor.name
  }
}
