const assert = require('assert')

const tanagra = require('../index')
const serializable = tanagra.serializable
const enableSerialization = tanagra.enableSerialization

class TestClass1 { }

describe('#serializable', () => {
  it('should return a class with the correct constructor metadata', () => {
    const clazz = serializable()(TestClass1)
    assert.equal(TestClass1.name, clazz.name, 'Decorated class has the wrong constructor name')
  })

  it('should set the static _serializationKey property by default to the class name', () => {
    const clazz = serializable()(TestClass1)
    assert.equal('TestClass1', clazz._serializationKey, 'Static _serializationKey not set')
  })

  it('should set the static _serializationKey property to the specified key', () => {
    const clazz = serializable('my key')(TestClass1)
    assert.equal('my key', clazz._serializationKey, 'Static _serializationKey not set')
  })
})

describe('#enableSerialization', () => {
  it('should return a class with the correct constructor metadata', () => {
    const clazz = enableSerialization(TestClass1)
    assert.equal(TestClass1.name, clazz.name, 'Decorated class has the wrong constructor name')
  })

  it('should set the static _serializationKey property by default to the class name', () => {
    const clazz = enableSerialization(TestClass1)
    assert.equal('TestClass1', clazz._serializationKey, 'Static _serializationKey not set')
  })
})
