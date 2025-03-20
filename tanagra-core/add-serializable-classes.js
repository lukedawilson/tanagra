const serializableClassMappings = require('./serializable-class-mappings').get

/**
 * Adds the prototype of the specified decorated class, and those of all classes referenced by it, to the global cache.
 * This prototype is then retrieved when a serialized object is deserialized.
 *
 * @memberOf module:tanagra-core
 * @function addSerializableClasses
 * @param clazz Decorated class to add to cache.
 * @example
 * const serializable = require('tanagra-core').serializable
 *
 * const SerializableFoo = serializable(class Foo {
 *    constructor(bar) {
 *      this.bar = bar
 *    }
 * }, [Bar])
 *
 * const SerializableBar = serializable(class Bar {
 *    constructor(baz) {
 *      this.baz = baz
 *    }
 * }, [Baz])
 *
 * const SerializableBaz = serializable(class Baz {
 *    constructor(string) {
 *      this.string = string
 *    }
 * })
 *
 * addSerializableClasses(SerializableFoo) // adds SerializableFoo, SerializableBar and SerializableBaz
 */
module.exports = function addSerializableClasses(clazz) {
  if (clazz._serializationKey) {
    serializableClassMappings().set(clazz._serializationKey, clazz.prototype)
  }
}
