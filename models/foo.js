class Foo {
  constructor(string = null, number = null, bars = []) {
    this.string = string
    this.number = number
    this.bars = bars

    // serialization properties
    this._serializationUniqueId = this.serializationUniqueId
  }

  func1() {
    return `${this.string}, ${this.number}`
  }

  get get1() {
    return this.bars.length
  }

  static staticFunc1() {
    return 'static'
  }

  static get staticGet1() {
    return 'more static'
  }

  get serializationUniqueId() {
    return module.filename
  }
}

module.exports = Foo
