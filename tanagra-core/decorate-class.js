const serializableClassMappings = require('./serializable-class-mappings').get

function addSerializableClasses(clazz) {
  if (clazz._serializationKey) {
    serializableClassMappings().set(clazz._serializationKey, clazz.prototype)
  }
}

/**
 * Decorates a class with serialization metadata.
 *
 * @memberOf module:tanagra-core
 * @function serializable
 * @param customSerializationKey By default, when the class is serialized, it is keyed on its name; this default can
 *                               be overridden by setting this parameter.
 *
 * @example <caption>Javascript</caption>
 *
 * const serializable = require('tanagra-core').serializable
 *
 * module.exports = serializable()(class Foo {
 *   constructor(barNumber, bazObject) {
 *     this.barNumber = barNumber // primitive
 *     this.bazObject = bazObject // serializable object
 *   }
 * })
 *
 * @example <caption>Typescript</caption>
 *
 * import { serializable } from 'tanagra-core'
 *
 * \@serializable()
 * export default class Foo {
 *   private bar: number
 *   private baz: Baz
 *
 *   constructor(bar: number, baz: Baz) {
 *     this.bar = bar // primitive
 *     this.baz = baz // serializable object
 *   }
 * }
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
