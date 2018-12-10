const assert = require('assert')
const serializable = require('tanagra-core').serializable

const init = require('../index').init
const encodeEntity = require('../encode-entity')
const decodeEntity = require('../decode-entity')

describe('#encodeEntity, #decodeEntity', () => {
  beforeEach(() => init())

  class WithFuncsAndGetters {
    constructor () {
      this.someString = 'some stringy string'
    }

    someInstanceFunc(someParam) {
      return `${this.someString}-${someParam}`
    }

    static someStaticFunc(someParam) {
      return someParam
    }

    get someInstanceGetter() {
      return this.someString
    }

    static get someStaticGetter() {
      return 'XYZ'
    }
  }

  describe('basic datatypes', () => {
    class SimpleClass {
      constructor() {
        this.someNumber = 123
        this.someString = 'hello world'
      }

      someNumberFunc() {
        return this.someNumber
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

    const simpleClass = serializable(SimpleClass)
    class ClassWithComplexArray {
      constructor() {
        this.someArray = [
          new simpleClass(),
          new simpleClass(),
          new simpleClass()
        ]
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

    class ClassWithComplexMap {
      constructor() {
        this.someMap = new Map([
          [123, new simpleClass()],
          [789, new simpleClass()],
          [456, new simpleClass()]
        ])
      }
    }

    it('should successfully encode/decode a simple class without serialization metadata', () => {
      const instance = new SimpleClass()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded)

      assert.strictEqual(123, decoded.someNumber)
      assert.strictEqual('hello world', decoded.someString)
    })

    it('should successfully encode/decode a simple class with serialization metadata', () => {
      const clazz = serializable(SimpleClass)
      const instance = new clazz()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded)

      assert.strictEqual(123, decoded.someNumber)
      assert.strictEqual('hello world', decoded.someString)
    })

    it('should handle dates', () => {
      const instance = new ClassWithDate()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded)
      assert.strictEqual(new Date(2018, 10, 22, 11, 43, 55).getTime(), decoded.someDate.getTime())
    })

    it('should handle arrays', () => {
      const withArray = new ClassWithArray()
      const encoded = encodeEntity(withArray)
      const decoded = decodeEntity(encoded)
      assert.deepStrictEqual([123, 789, 456], decoded.someArray)
    })

    it('should handle arrays of complex types', () => {
      const classWithComplexArray = serializable(ClassWithComplexArray, [simpleClass])
      const withArray = new classWithComplexArray()
      const encoded = encodeEntity(withArray)
      const decoded = decodeEntity(encoded, classWithComplexArray)
      assert.deepStrictEqual(123, decoded.someArray[0].someNumberFunc())
      assert.deepStrictEqual(123, decoded.someArray[1].someNumberFunc())
      assert.deepStrictEqual(123, decoded.someArray[2].someNumberFunc())
    })

    it('should handle maps', () => {
      const instance = new ClassWithMap()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded)
      assert.deepStrictEqual('foo', decoded.someMap.get(123))
      assert.deepStrictEqual('bar', decoded.someMap.get(789))
      assert.deepStrictEqual('baz', decoded.someMap.get(456))
    })

    it('should handle maps of complex types', () => {
      const classWithComplexMap = serializable(ClassWithComplexMap, [simpleClass])
      const instance = new classWithComplexMap()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded, classWithComplexMap)
      assert.deepStrictEqual(123, decoded.someMap.get(123).someNumber)
      assert.deepStrictEqual(123, decoded.someMap.get(789).someNumber)
      assert.deepStrictEqual(123, decoded.someMap.get(456).someNumber)
    })
  })

  describe('functions and getters', () => {
    it('should correctly set instance functions and getters', () => {
      const clazz = serializable(WithFuncsAndGetters)
      const instance = new clazz()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded, clazz)

      assert.strictEqual(`${decoded.someString}-XXX`, decoded.someInstanceFunc('XXX'))
      assert.strictEqual(decoded.someString, decoded.someInstanceGetter)
    })

    it('should correctly set static functions and getters', () => {
      const clazz = serializable(WithFuncsAndGetters)
      const instance = new clazz()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded, clazz)

      assert.strictEqual('XXX', decoded.constructor.someStaticFunc('XXX'))
      assert.strictEqual('XYZ', decoded.constructor.someStaticGetter)
    })
  })

  describe('nesting', () => {
    const withFuncsAndGetters = serializable(WithFuncsAndGetters)

    it('should support simple nesting', () => {
      class WithNestedOuter {
        constructor() {
          this.primitive = 123
          this.nested = new withNestedInner()
        }
      }

      class WithNestedInner {
        constructor() {
          this.primitive = 'hello world'
          this.nested = new withFuncsAndGetters()
        }
      }

      const withNestedInner = serializable(WithNestedInner, [withFuncsAndGetters])
      const withNestedOuter = serializable(WithNestedOuter, [withNestedInner])

      const instance = new withNestedOuter()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded, withNestedOuter)

      assert.strictEqual(123, decoded.primitive)
      assert.strictEqual('WithNestedOuter', decoded.constructor.name)
      assert.strictEqual('hello world', decoded.nested.primitive)
      assert.strictEqual('WithNestedInner', decoded.nested.constructor.name)
      assert.strictEqual('some stringy string', decoded.nested.nested.someString)
      assert.strictEqual('some stringy string', decoded.nested.nested.someInstanceGetter)
      assert.strictEqual('some stringy string-XXX', decoded.nested.nested.someInstanceFunc('XXX'))
      assert.strictEqual('XYZ', decoded.nested.nested.constructor.someStaticGetter)
      assert.strictEqual('XXX', decoded.nested.nested.constructor.someStaticFunc('XXX'))
      assert.strictEqual('WithFuncsAndGetters', decoded.nested.nested.constructor.name)
    })

    it('should support array and map nesting', () => {
      class WithMapOuter {
        constructor() {
          this.primitive = 123
          this.map = new Map([
            ['a', new withMapInner()],
            ['b', new withMapInner()],
            ['c', new withMapInner()]
          ])
        }
      }

      class WithMapInner {
        constructor() {
          this.primitive = 'hello world'
          this.innerMap = new Map([
            [123, new withFuncsAndGetters()],
            [456, new withFuncsAndGetters()],
            [789, new withFuncsAndGetters()]
          ])
        }

        myFunc() {
          return this.primitive
        }
      }

      const withMapInner = serializable(WithMapInner, [withFuncsAndGetters])
      const withMapOuter = serializable(WithMapOuter, [withMapInner])

      const instance = new withMapOuter()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded, withMapOuter)

      for (const key of ['a', 'b', 'c']) {
        const innerInst = decoded.map.get(key)
        assert.strictEqual('WithMapInner', innerInst.constructor.name)
        assert.strictEqual('hello world', innerInst.myFunc())

        for (const innerKey of [123, 789, 456]) {
          const withFuncsAndGettersInst = innerInst.innerMap.get(innerKey)
          assert.strictEqual('WithFuncsAndGetters', withFuncsAndGettersInst.constructor.name)
          assert.strictEqual('some stringy string', withFuncsAndGettersInst.someInstanceGetter)
          assert.strictEqual('some stringy string-XXX', withFuncsAndGettersInst.someInstanceFunc('XXX'))
          assert.strictEqual('XYZ', withFuncsAndGettersInst.constructor.someStaticGetter)
          assert.strictEqual('XXX', withFuncsAndGettersInst.constructor.someStaticFunc('XXX'))
        }
      }
    })
  })
})
