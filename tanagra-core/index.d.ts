declare module 'tanagra-core' {
  /**
   * Decorates a class with serialization metadata, required when deserializing it.
   *
   * @memberOf module:tanagra-core
   * @function serializable
   * @param clazz The class to decorate
   * @example
   * import { serializable } from 'tanagra-core'
   *
   * class Foo {
   *   constructor(bar: number, baz: Baz) {
   *     this.bar = bar // primitive
   *     this.baz = baz // serializable object
   *   }
   * }
   *
   * enableSerialization(Foo);
   * export default Foo;
   */
  export function enableSerialization<T>(clazz: typeof T): void;
}
