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

module.exports = Bar
