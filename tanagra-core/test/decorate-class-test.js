const assert = require('assert')

const serializable = require('../decorate-class')

class TestClass1 { }
class TestClass2 { }
class TestClass3 { }

describe('#serializable', () => {
  it('should set the static and instance _serializationKey properties by default to the class name', () => {
    const clazz = serializable(TestClass1)
    const instance = new clazz()
    assert.equal('TestClass1', clazz._serializationKey)
    assert.equal('TestClass1', instance._serializationKey)
  })

  it('should set the static and instance _serializationKey properties to the specified key', () => {
    const clazz = serializable(TestClass1, null, 'my key')
    const instance = new clazz()
    assert.equal('my key', clazz._serializationKey)
    assert.equal('my key', instance._serializationKey)
  })

  it('should set the static _fieldTypes property on the class', () => {
    const nestedClazz1 = serializable(TestClass2)
    const nestedClazz2 = serializable(TestClass3)
    const clazz = serializable(TestClass1, [nestedClazz1, nestedClazz2])
    assert.equal(nestedClazz1, clazz._fieldTypes.get('TestClass2'))
    assert.equal(nestedClazz2, clazz._fieldTypes.get('TestClass3'))
  })
})
