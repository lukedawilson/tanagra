const protobuf = require('protobufjs')

class CustomReader extends protobuf.Reader {
  constructor(buffer) {
    super(buffer)
  }

  double() {
    const number = super.double()
    return new Date(number)
  }
}

module.exports = CustomReader
