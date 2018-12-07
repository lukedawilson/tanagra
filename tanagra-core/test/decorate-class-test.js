const assert = require('assert')

const serializable = require('../decorate-class')

class TestClass1 { }
class TestClass2 { }
class TestClass3 { }

describe('#serializable', () => {
  it('should return a class with the correct constructor metadata', () => {
    const clazz = serializable(TestClass1)

    assert.equal(TestClass1.name, clazz.name, 'Decorated class has the wrong constructor name')
  })

  it('should set the static and instance _serializationKey properties by default to the class name', () => {
    const clazz = serializable(TestClass1)
    const instance = new clazz()

    assert.equal('TestClass1', clazz._serializationKey, 'Static _serializationKey not set')
    assert.equal('TestClass1', instance._serializationKey, 'Instance _serializationKey not set')
    assert.notEqual(-1, Reflect.ownKeys(instance).indexOf('_serializationKey'), 'Instance _serializationKey not a field, so will not be serialized')
  })

  it('should set the static and instance _serializationKey properties to the specified key', () => {
    const clazz = serializable(TestClass1, null, 'my key')
    const instance = new clazz()

    assert.equal('my key', clazz._serializationKey, 'Static _serializationKey not set')
    assert.equal('my key', instance._serializationKey, 'Instance _serializationKey not set')
    assert.notEqual(-1, Reflect.ownKeys(instance).indexOf('_serializationKey'), 'Instance _serializationKey not a field, so will not be serialized')
  })

  it('should set the static _fieldTypes property on the class', () => {
    const nestedClazz1 = serializable(TestClass2)
    const nestedClazz2 = serializable(TestClass3)
    const clazz = serializable(TestClass1, [nestedClazz1, nestedClazz2])

    assert.equal(nestedClazz1, clazz._fieldTypes.get('TestClass2'), 'TestClass2 not added to _fieldTypes map')
    assert.equal(nestedClazz2, clazz._fieldTypes.get('TestClass3'), 'TestClass3 not added to _fieldTypes map')
  })
})
