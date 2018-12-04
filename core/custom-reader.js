const protobuf = require('protobufjs')

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
