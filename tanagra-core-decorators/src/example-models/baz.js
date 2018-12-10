const serializable = require('../serializable-attribute')

@serializable()
export default class Baz {
  constructor(string = null, number = null) {
    this.string = string
    this.number = number
    this.map = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 2],
    ])
  }

  someBazFunc() {
    return `bazbaz ${this.string}`
  }
}
