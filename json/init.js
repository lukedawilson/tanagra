module.exports = function (serializable) {
  global.serializable = serializable || new Map()
}
