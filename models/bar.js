const Baz = require('./baz')

class Bar {
  constructor() {
    this.prop1 = 'goodbye cruel world'
    this.prop2 = new Date()
    this.baz = new Baz()
  }
}

module.exports = Bar
