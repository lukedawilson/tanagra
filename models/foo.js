const Bar = require('./bar')

class Foo {
  constructor() {
    this.prop1 = 'hello world'
    this.prop2 = 123123
    this.bar = [ new Bar(), new Bar() ]

    // serialization properties
    this.filePath = module.filename
  }

  func1() {
    return `${this.prop1}, ${this.prop2}`
  }
}

module.exports = Foo
