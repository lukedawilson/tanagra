/**
 * Returns an ES6 Map, mapping the _serializationKey of a serialised class to its prototype.
 * Needed if extending tanagra with custom serializers.
 *
 * @memberOf module:tanagra-core
 * @function serializableClassMappings
 *
 * @example <caption>Javascript</caption>
 *
 * const serializableClassMappings = require('tanagra-core').serializableClassMappings.get
 *
 * const prototype = serializableClassMappings.get(instance._serializationKey)
 *
 * @example <caption>Typescript</caption>
 *
 * import { serializableClassMappings } from 'tanagra-core'
 *
 * const prototypes = serializableClassMappings.get
 * const prototype = prototypes.get(instance._serializationKey)
 */
module.exports = {
  get: function() {
    if (!global.serializable) {
      global.serializable = new Map()
    }

    return global.serializable
  },
  set: function (serializable) {
    global.serializable = serializable
  }
}
