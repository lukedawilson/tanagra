const addSerializableClasses = require('./add-serializable-classes')

/**
 * Decorates a class with serialization metadata, required when deserializing it.
 *
 * @memberOf module:tanagra-core
 * @function serializable
 * @param clazz Class to decorate with serialization metadata.
 * @param nestedClazzes Referenced classes. (Note that the library traverses this list recursively, so there's no need
 *                      to list all classes recursively.)
 * @param previousVersions Lists of referenced classes for previous versions of this class (an array of arrays).
 * @param customSerializationKey By default, when the class is serialized, it is keyed on its name; this default can
 *                               be overridden by setting this parameter.
 * @example
 * const serializable = require('tanagra-core').serializable
 * class Foo {
 *    constructor(string, bar) {
 *      this.string = string // a primitive type - no need to specify it as a dependency
 *      this.bar = bar
 *    }
 * }
 * module.exports = serializable(Foo, [Bar])
 *
 * // ...
 *
 * const serializable = require('tanagra-core').serializable
 * class Bar {
 *    constructor(number, baz, fooBar) {
 *      this.number = number // another primitive
 *      this.baz = baz
 *      this.fooBar = fooBar
 *    }
 * }
 * module.exports = serializable(Bar, [Baz, FooBar], [
 *    // referenced types for previous versions of Bar
 *   [Baz3, FooBar],
 *   [Baz2],
 *   [Baz1]
 * ])
 *
 * // ...
 *
 * module.exports = require('tanagra-core').serializable(class Baz1 { })
 * // etc.
 */
module.exports = function(clazz, nestedClazzes = [], previousVersions = [], customSerializationKey) {
  const allVersions = nestedClazzes.concat(previousVersions.flatMap(ver => ver))
  const fieldTypes = new Map(allVersions.map(klass => [klass._serializationKey, klass]))
  Reflect.defineProperty(clazz, '_fieldTypes', {
    get: function _fieldTypes() { return fieldTypes },
    configurable: true
  })

  const serializationKey = customSerializationKey || clazz.name
  Reflect.defineProperty(clazz, '_serializationKey', {
    get: function _serializationKey() { return serializationKey },
    configurable: true
  })

  // add class mappings for deserialization
  addSerializableClasses(clazz)

  return clazz
}
