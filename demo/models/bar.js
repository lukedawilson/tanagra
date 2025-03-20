const serializable = require('../../tanagra-core/index').serializable // require('tanagra-core').serializable

const Baz = require('./baz')

module.exports = serializable()(class Bar {
  constructor(string = null, date = null, baz = null) {
    this.string = string
    this.date = date
    this.baz = baz
  }

  someFunc() {
    return `Funky ${this.string}`
  }
})
