const serializable = require('tanagra-core').serializable

class Baz {
  constructor(string = null, number = null) {
    this.string = string
    this.number = number
  }

  someBazFunc() {
    return `bazbaz ${this.string}`
  }
}

module.exports = serializable(Baz)
