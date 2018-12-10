import * as json from '../../tanagra-json/index'

import Foo from './example-models/foo'
import Bar from './example-models/bar'
import Baz from './example-models/baz'

const baz = new Baz('Simple Baz', 456456)

const bar1 = new Bar('Complex Bar 1', new Date(), baz)
const bar2 = new Bar('Complex Bar 2', new Date(), baz)

const baz1 = new Baz('baz1', 111)
const baz2 = new Baz('baz2', 222)
const baz3 = new Baz('baz3', 333)
const bazs = new Map()
bazs.set(baz1.string, baz1)
bazs.set(baz2.string, baz2)
bazs.set(baz3.string, baz3)

const foo = new Foo('Hello foo', 123123, [bar1, bar2], bazs)
console.log('Before:')
console.log(foo)
console.log()

const encoded = json.encodeEntity(foo)

const decoded = json.decodeEntity(encoded, Foo)
console.log('After:')
console.log(decoded)
console.log(decoded.get1)
console.log()
