const assert = require('assert')
const serializable = require('tanagra-core').serializable

const encodeEntity = require('../encode-entity')
const decodeEntity = require('../decode-entity')

class SimpleClass {
  constructor() {
    this.someNumber = 123
    this.someString = 'hello world'
  }
}

class ClassWithDate {
  constructor() {
    this.someDate = new Date(2018, 10, 22, 11, 43, 55)
  }
}

class ClassWithArray {
  constructor() {
    this.someArray = [123, 789, 456]
  }
}

class ClassWithMap {
  constructor() {
    this.someMap = new Map([
      [123, 'foo'],
      [789, 'bar'],
      [456, 'baz']
    ])
  }
}

describe('#encodeEntity, #decodeEntity', () => {
  it('should successfully encode/decode a simple class without serialization metadata', () => {
    const simple = new SimpleClass()
    const encoded = encodeEntity(simple)
    const decoded = decodeEntity(encoded)

    assert.equal(JSON.stringify(simple), encoded)
    assert.equal(123, decoded.someNumber)
    assert.equal('hello world', decoded.someString)
  })

  it('should successfully encode/decode a simple class with serialization metadata', () => {
    const decorated = serializable(SimpleClass)
    const simple = new decorated()
    const encoded = encodeEntity(simple)
    const decoded = decodeEntity(encoded)

    assert.equal(JSON.stringify(simple), encoded)
    assert.equal(123, decoded.someNumber)
    assert.equal('hello world', decoded.someString)
  })

  it('should handle dates', () => {
    const withDate = new ClassWithDate()
    const encoded = encodeEntity(withDate)
    const decoded = decodeEntity(encoded)
    assert.equal(new Date(2018, 10, 22, 11, 43, 55).getTime(), decoded.someDate.getTime())
  })

  it('should handle arrays', () => {
    const withArray = new ClassWithArray()
    const encoded = encodeEntity(withArray)
    const decoded = decodeEntity(encoded)
    assert.deepEqual([123, 789, 456], decoded.someArray)
  })

  it('should handle maps', () => {
    const withMap = new ClassWithMap()
    const encoded = encodeEntity(withMap)
    const decoded = decodeEntity(encoded)
    assert.deepEqual('foo', decoded.someMap.get(123))
    assert.deepEqual('bar', decoded.someMap.get(789))
    assert.deepEqual('baz', decoded.someMap.get(456))
  })
})
