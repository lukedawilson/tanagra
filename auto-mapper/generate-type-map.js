function serializableClasses(baseModule, map) {
  if (baseModule.exports._serializationKey) {
    map.set(baseModule.exports._serializationKey, baseModule.exports.prototype)
  }

  baseModule.children
    .filter(mod => mod.filename.indexOf('node_modules') === -1)
    .forEach(mod => serializableClasses(mod, map))
}

module.exports = function(baseModule) {
  const serializable = new Map()
  serializableClasses(baseModule, serializable)
  return serializable
}
