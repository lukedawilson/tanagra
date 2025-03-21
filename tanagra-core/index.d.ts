declare module 'tanagra-core' {
  /**
   * Decorates a class with serialization metadata.
   *
   * @memberOf module:tanagra-core
   * @function serializable
   * @param customSerializationKey By default, when the class is serialized, it is keyed on its name; this default can
   *                               be overridden by setting this parameter.
   *
   * @example
   *
   * import { serializable } from 'tanagra-core'
   *
   * @serializable()
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
  export function serializable(customSerializationKey?: string): ClassDecorator;
}
