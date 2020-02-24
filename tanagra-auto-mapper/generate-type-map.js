function addSerializableClasses(baseModule, map) {
  if (baseModule.exports._serializationKey) {
    map.set(baseModule.exports._serializationKey, baseModule.exports.prototype)
  }

  baseModule.children
    .filter(mod => mod.filename.indexOf('node_modules') === -1)
    .forEach(mod => addSerializableClasses(mod, map))
}

/**
 * Walks the module tree in _node.js_ to build up a map of classes, meaning the user doesn't have to specify the type
 * to deserialize to.
 *
 * @memberOf module:tanagra-auto-mapper
 * @function generateTypeMap
 * @param baseModule The module which contains all other modules to be analyzed.
 * @returns Map Map of the _serializationKey of a serialised class to its prototype.
 *
 * @example
 * generateTypeMap(module)
 */
module.exports = function(baseModule) {
  const serializable = new Map()
  addSerializableClasses(baseModule, serializable)
  return serializable
}
