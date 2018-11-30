class Bar {
  constructor(string = null, date = null, baz = null) {
    this.string = string
    this.date = date
    this.baz = baz

    // serialization properties
    this.filePath = module.filename
  }

  someFunc() {
    return `Funky ${this.string}`
  }
}

module.exports = Bar
