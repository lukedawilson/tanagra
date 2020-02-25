const assert = require('assert')

const serializable = require('../decorate-class')

class TestClass1 { }
class TestClass2 { }
class TestClass3 { }
class TestClass4 { }
class TestClass5 { }
class TestClass6 { }

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
    const clazz = serializable(TestClass1, undefined, undefined, 'my key')
    const instance = new clazz()

    assert.equal('my key', clazz._serializationKey, 'Static _serializationKey not set')
    assert.equal('my key', instance._serializationKey, 'Instance _serializationKey not set')
    assert.notEqual(-1, Reflect.ownKeys(instance).indexOf('_serializationKey'), 'Instance _serializationKey not a field, so will not be serialized')
  })

  it('should set the static _fieldTypes property on the class when no previous versions are specified', () => {
    const nestedClazz2 = serializable(TestClass2)
    const nestedClazz3 = serializable(TestClass3)
    const clazz = serializable(TestClass1, [nestedClazz2, nestedClazz3])

    assert.equal(nestedClazz2, clazz._fieldTypes.get('TestClass2'), 'TestClass2 not added to _fieldTypes map')
    assert.equal(nestedClazz3, clazz._fieldTypes.get('TestClass3'), 'TestClass3 not added to _fieldTypes map')
  })

  it('should set the static _fieldTypes property on the class when previous versions are specified', () => {
    const nestedClazz2 = serializable(TestClass2)
    const nestedClazz3 = serializable(TestClass3)
    const nestedClazz4 = serializable(TestClass4)
    const nestedClazz5 = serializable(TestClass5)
    const nestedClazz6 = serializable(TestClass6)
    const clazz = serializable(TestClass1, [nestedClazz2, nestedClazz3], [
      [nestedClazz4, nestedClazz5],
      [nestedClazz5, nestedClazz6]
    ])

    assert.equal(nestedClazz2, clazz._fieldTypes.get('TestClass2'), 'TestClass2 not added to _fieldTypes map')
    assert.equal(nestedClazz3, clazz._fieldTypes.get('TestClass3'), 'TestClass3 not added to _fieldTypes map')
    assert.equal(nestedClazz4, clazz._fieldTypes.get('TestClass4'), 'TestClass4 not added to _fieldTypes map')
    assert.equal(nestedClazz5, clazz._fieldTypes.get('TestClass5'), 'TestClass5 not added to _fieldTypes map')
    assert.equal(nestedClazz6, clazz._fieldTypes.get('TestClass6'), 'TestClass6 not added to _fieldTypes map')
  })
})
