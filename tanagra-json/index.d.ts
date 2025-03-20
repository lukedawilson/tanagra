declare module 'tanagra-json' {
  /**
   * Serializes a decorated class instance as a JSON string.
   *
   * @memberOf module:tanagra-json
   * @function encodeEntity
   * @param instance A decorated class instance.
   *
   * @returns String JSON encoding of the instance.
   * @example
   * import { encodeEntity } from 'tanagra-json'
   * const foo = new SomeDecoratedClass()
   * const serialized = json.encodeEntity(foo)
   */
  export function encodeEntity<TEntity>(instance: TEntity): string;

  /**
   * Deserializes a class instance that was serialized in JSON format.
   *
   * @memberOf module:tanagra-json
   * @function decodeEntity
   * @param encoded Serialized instance, with class metadata.
   *
   * @returns Object Deserialized instance of specified type.
   * @example
   * import { decodeEntity } from 'tanagra-json'
   * const foo = decodeEntity(someSerializedJsonString)
   */
  export function decodeEntity<TEntity>(encoded: string): TEntity;
}
