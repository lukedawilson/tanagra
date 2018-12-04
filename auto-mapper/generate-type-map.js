function addSerializableClasses(baseModule, map) {
  if (baseModule.exports._serializationKey) {
    map.set(baseModule.exports._serializationKey, baseModule.exports.prototype)
  }

  baseModule.children
    .filter(mod => mod.filename.indexOf('node_modules') === -1)
    .forEach(mod => addSerializableClasses(mod, map))
}

module.exports = function(baseModule) {
  const serializable = new Map()
  addSerializableClasses(baseModule, serializable)
  return serializable
}
