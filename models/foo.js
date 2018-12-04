const Bar = require('./bar')
const Baz = require('./baz')

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

Foo._fieldTypes = new Map([
  [new Bar()._serializationKey, Bar],
  [new Baz()._serializationKey, Baz]
])

module.exports = Foo
