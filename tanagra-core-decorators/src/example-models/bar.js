const serializable = require('../serializable-attribute')

const Baz = require('./baz')

@serializable([Baz])
export default class Bar {
  constructor(string = null, date = null, baz = null) {
    this.string = string
    this.date = date
    this.baz = baz
  }

  someFunc() {
    return `Funky ${this.string}`
  }
}
