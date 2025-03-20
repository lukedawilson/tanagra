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
   * @param customSerializationKey By default, when the class is serialized, it is keyed on its name; this default can
   *                               be overridden by setting this parameter.
   * @example
   * import { serializable } from 'tanagra-core'
   *
   * export default serializable()(class Foo {
   *   constructor(bar: number, baz: Baz) {
   *     this.bar = bar // primitive
   *     this.baz = baz // serializable object
   *   }
   * })
   */
   export function serializable<T extends Constructor>(
     customSerializationKey?: string
   ): T;
}
