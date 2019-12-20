module.exports = instance => instance.constructor.name === 'Object'
  ? `Object_${Object.keys(instance).join('')}`
  : instance._serializationKey || instance.constructor.name
