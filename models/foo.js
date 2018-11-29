const Bar = require('./bar')

class Foo {
  constructor(string = null, number = null, bars = []) {
    this.string = string
    this.number = number
    this.bars = bars

    // serialization properties
    this.filePath = module.filename
  }

  func1() {
    return `${this.string}, ${this.number}`
  }
}

module.exports = Foo
