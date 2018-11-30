class Bar {
  constructor(string = null, date = null, baz = null) {
    this.string = string
    this.date = date
    this.baz = baz

    // serialization properties
    this._serializationUniqueId = this.serializationUniqueId
  }

  someFunc() {
    return `Funky ${this.string}`
  }

  get serializationUniqueId() {
    return module.filename
  }
}

module.exports = Bar
