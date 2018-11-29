const Baz = require('./baz')

class Bar {
  constructor(string = null, date = null, baz = null) {
    this.string = string
    this.date = date
    this.baz = baz
  }
}

module.exports = Bar
