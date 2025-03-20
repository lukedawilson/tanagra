const addSerializableClasses = require('./add-serializable-classes')

/**
 * Decorates a class with serialization metadata, and returns the class.
 *
 * @memberOf module:tanagra-core
 * @function serializable
 * @param customSerializationKey By default, when the class is serialized, it is keyed on its name; this default can
 *                               be overridden by setting this parameter.
 * @example
 * const serializable = require('tanagra-core').serializable
 *
 * module.exports = serializable()(class Foo {
 *   constructor(barNumber, bazObject) {
 *     this.barNumber = barNumber // primitive
 *     this.bazObject = bazObject // serializable object
 *   }
 * })
 */
module.exports = function(customSerializationKey) {
  return function (clazz) {
    const serializationKey = customSerializationKey || clazz.name
    Reflect.defineProperty(clazz, '_serializationKey', {
      get: function _serializationKey() { return serializationKey },
      configurable: true
    })

    // add class mappings for deserialization
    addSerializableClasses(clazz)

    return clazz
  }
}
