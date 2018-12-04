const serializable = require('../core/decorate-class')

const Bar = require('./bar')
const Baz = require('./baz')

class Foo {
  constructor(string = null, number = null, bars = [], bazs = null) {
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
}

module.exports = serializable(Foo, module.filename, [Bar, Baz])
