class Baz {
  constructor(string = null, number = null) {
    this.serializable()

    this.string = string
    this.number = number
  }

  someBazFunc() {
    return `bazbaz ${this.string}`
  }

  serializable() {
    this._serializationKey =  module.filename
  }
}

module.exports = Baz
