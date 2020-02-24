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

/**
 * An extension of
 * {@link https://github.com/protobufjs/protobuf.js/blob/5f2f62bcfd9bb69b34efbcfefffddf92daecf480/src/reader_buffer.js|BufferReader}
 * that supports dates.
 *
 * @package
 * @memberOf module:tanagra-protobuf
 * @class CustomReader
 * @type {CustomReader}
 */
module.exports = CustomReader
