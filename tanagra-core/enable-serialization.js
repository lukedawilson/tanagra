/**
 * Decorates a class with serialization metadata.
 * Useful when developing in Typescript because of
 * <a href="https://github.com/microsoft/TypeScript/issues/41231">limitations</a> of the type system.
 *
 * @memberOf module:tanagra-core
 * @function enableSerialization
 * @example
 * // Typescript
 *
 * import { enableSerialization } from 'tanagra-core'
 *
 * class Foo {
 *   constructor(bar: number, baz: Baz) {
 *     this.bar = bar // primitive
 *     this.baz = baz // serializable object
 *   }
 * }
 *
 * enableSerialization(Foo)
 * export default Foo
 */
module.exports = require('./decorate-class')()
