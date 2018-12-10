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
