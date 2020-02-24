/**
 * Returns an ES6 Map, mapping the _serializationKey of a serialised class to its prototype.
 *
 * @memberOf module:tanagra-core
 * @function serializableClassMappings
 * @example
 * const serializableClassMappings = require('tanagra-core').serializableClassMappings
 * serializableClassMappings.get().set(Foo._serializationKey, Foo.prototype)
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
