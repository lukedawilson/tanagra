const protobuf = require('protobufjs')

/*
 * Extends the default reader to support date serialization.
 */
class CustomReader extends protobuf.BufferReader {
  constructor(buffer) {
    super(buffer)
  }

  double() {
    const value = super.double()
    return new Date(value)
  }
}

module.exports = CustomReader
