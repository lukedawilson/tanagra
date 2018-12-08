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

    it('should handle maps', () => {
      const instance = new ClassWithMap()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded)
      assert.deepStrictEqual('foo', decoded.someMap.get(123))
      assert.deepStrictEqual('bar', decoded.someMap.get(789))
      assert.deepStrictEqual('baz', decoded.someMap.get(456))
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
    class WithNested1 {
      constructor() {
        this.primitive = 123
        this.nested = new withNested2()
      }
    }

    class WithNested2 {
      constructor() {
        this.primitive = 'hello world'
        this.nested = new withFuncsAndGetters()
      }
    }

    class WithArrayNesting {
      constructor() {
        this.nestedArray = [
          new withNested1(),
          new withNested1(),
          new withNested1()
        ]
      }
    }

    class WithMapNesting {
      constructor() {
        this.nestedMap = new Map([
          ['a', new withNested4()],
          ['b', new withNested4()],
          ['c', new withNested4()]
        ])
      }
    }

    class WithNested3 {
      constructor() {
        this.array = new withArrayNesting()
        this.map = new withMapNesting()
      }
    }

    class WithNested4 {
      constructor() {
        this.primitive = 123
        this.nested = new Map([
          ['a', new withNested2()],
          ['b', new withNested2()]
        ])
      }

      myFunc() {
        return this.primitive
      }
    }

    const withFuncsAndGetters = serializable(WithFuncsAndGetters)
    const withNested2 = serializable(WithNested2, [withFuncsAndGetters])
    const withNested1 = serializable(WithNested1, [withNested2])
    const withArrayNesting = serializable(WithArrayNesting, [withNested1])
    const withNested4 = serializable(WithNested4, [withNested2])
    const withMapNesting = serializable(WithMapNesting, [withNested4])
    const withNested3 = serializable(WithNested3, [withArrayNesting, withMapNesting])

    it('should support simple nesting', () => {
      const instance = new withNested1()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded, withNested1)

      assert.strictEqual(123, decoded.primitive)
      assert.strictEqual('WithNested1', decoded.constructor.name)
      assert.strictEqual('hello world', decoded.nested.primitive)
      assert.strictEqual('WithNested2', decoded.nested.constructor.name)
      assert.strictEqual('some stringy string', decoded.nested.nested.someString)
      assert.strictEqual('some stringy string', decoded.nested.nested.someInstanceGetter)
      assert.strictEqual('some stringy string-XXX', decoded.nested.nested.someInstanceFunc('XXX'))
      assert.strictEqual('XYZ', decoded.nested.nested.constructor.someStaticGetter)
      assert.strictEqual('XXX', decoded.nested.nested.constructor.someStaticFunc('XXX'))
      assert.strictEqual('WithFuncsAndGetters', decoded.nested.nested.constructor.name)
    })

    it('should support array and map nesting', () => {
      const instance = new withNested3()
      const encoded = encodeEntity(instance)
      const decoded = decodeEntity(encoded, withNested3)

      for (let i = 0; i < 3; i++) {
        const withNested1Inst = decoded.array.nestedArray[i]
        assert.strictEqual('WithNested1', withNested1Inst.constructor.name)

        const withNested2Inst = withNested1Inst.nested
        assert.strictEqual('WithNested2', withNested2Inst.constructor.name)

        const withFuncsAndGettersInst = withNested2Inst.nested
        assert.strictEqual('WithFuncsAndGetters', withFuncsAndGettersInst.constructor.name)
        assert.strictEqual('some stringy string', withFuncsAndGettersInst.someInstanceGetter)
        assert.strictEqual('some stringy string-XXX', withFuncsAndGettersInst.someInstanceFunc('XXX'))
        assert.strictEqual('XYZ', withFuncsAndGettersInst.constructor.someStaticGetter)
        assert.strictEqual('XXX', withFuncsAndGettersInst.constructor.someStaticFunc('XXX'))
      }

      for (const key of ['a', 'b', 'c']) {
        const withNested4Inst = decoded.map.nestedMap.get(key)
        assert.strictEqual('WithNested4', withNested4Inst.constructor.name)
        assert.strictEqual(123, withNested4Inst.myFunc())

        for (const innerKey of ['a', 'b']) {
          const withNested2Inst = withNested4Inst.nested.get(innerKey)
          assert.strictEqual('WithNested2', withNested2Inst.constructor.name)

          const withFuncsAndGettersInst = withNested2Inst.nested
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
