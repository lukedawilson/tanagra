class Foo {
  constructor(string = null, number = null, bars = [], bazs = null) {
    this.serializable()

    this.string = string
    this.number = number
    this.bars = bars
    this.bazs = bazs || new Map()
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

  serializable() {
    this._serializationKey = module.filename
  }
}

module.exports = Foo
