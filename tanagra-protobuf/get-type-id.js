module.exports = instance => {
  switch (instance.constructor.name) {
    case 'Object':
      return `Object_${Object.keys(instance).join('')}`
    case 'KeyValuePair':
      return `KeyValuePair_${instance._keySerializationKey}${instance._valueSerializationKey}`
    default:
      return instance._serializationKey || instance.constructor.name
  }
}
