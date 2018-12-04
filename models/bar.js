const Baz = require('./baz')

class Bar {
  constructor(string = null, date = null, baz = null) {
    this.serializable()

    this.string = string
    this.date = date
    this.baz = baz
  }

  someFunc() {
    return `Funky ${this.string}`
  }

  serializable() {
    this._serializationKey =  module.filename
  }
}

Bar._fieldTypes = new Map([
  [new Baz()._serializationKey, Baz]
])

module.exports = Bar
