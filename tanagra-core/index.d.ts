declare module 'tanagra-core' {
  export type Constructor = {
    new (...args: any[]): any;
    name: string;
  };

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
     * import { serializable } from 'tanagra-core'
     * class Foo {
     *   constructor(string, bar) {
     *      this.string = string // a primitive type - no need to specify it as a dependency
     *      this.bar = bar
     *   }
     * }
     * export default serializable(Foo, [Bar])
     *
     * // ...
     *
     * import { serializable } from 'tanagra-core'
     * class Bar {
     *   constructor(number, baz, fooBar) {
     *     this.number = number // another primitive
     *     this.baz = baz
     *     this.fooBar = fooBar
     *   }
     * }
     * export default serializable(Bar, [Baz, FooBar], [
     *   // referenced types for previous versions of Bar
     *   [Baz3, FooBar],
     *   [Baz2],
     *   [Baz1]
     * ])
     *
     * // ...
     *
     * export default serializable(class Baz1 {
     *   // ...
     * })
     */
    export function serializable<T extends Constructor>(
      clazz: T,
      nestedClazzes?: Array<Constructor>,
      previousVersions?: Array<Array<Constructor>>,
      customSerializationKey?: string
    ): T;
}
