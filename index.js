const protobuf = require('protobufjs')
// const util = require('util')
// const redis = require('redis')
//
// redis.getAsync = util.promisify(redis.get)
// redis.setAsync = util.promisify(redis.set)
// redis.delAsync = util.promisify(redis.del)
// redis.keysAsync = util.promisify(redis.keys)

/************************
 * Test data structures *
 ************************/

class Foo {
  constructor() {
    this.prop1 = 'hello world'
    this.prop2 = 123123
    this.bar = [ new Bar(), new Bar() ]
  }

  get serializable() {
    return true
  }
}

class Bar {
  constructor() {
    this.prop1 = 'goodbye cruel world'
    this.prop2 = new Date()
    this.baz = new Baz()
  }

  get serializable() {
    return true
  }
}

class Baz {
  constructor() {
    this.prop1 = 'simple class'
    this.prop2 = 789789
  }

  get serializable() {
    return true
  }
}

/******************
 * Test functions *
 ******************/

const typeMap = {
  'String': 'string',
  'Number': 'int32',
  'Boolean': 'bool'
}

function getType(entity) {
  return typeMap[entity.constructor.name] || entity.constructor.name
}

function decodeEntity(tuple) {
  const entity = new Buffer(tuple.encoded)
  const type = tuple.type
  const fields = tuple.fields

  const MyType = new protobuf.Type(type)
  fields.forEach(field => {
    MyType.add(new protobuf.Field(field.name, field.id, field.type))
  })

  const decoded = MyType.decode(entity)
  Object.entries(decoded).forEach(entry => {
    const kvp = { key: entry[0], value: entry[1] }
    if (!kvp.value) return

    if (kvp.key.indexOf('_encoded') !== -1) {
      const key = kvp.key.replace('_encoded', '')
      const type = decoded[`${key}_type`]
      const fields = JSON.parse(decoded[`${key}_fields`])
      decoded[key] = decodeEntity({ encoded: kvp.value, type, fields })

      delete decoded[kvp.key]
      delete decoded[`${key}_type`]
      delete decoded[`${key}_fields`]
    } else if (kvp.key.indexOf('_array') !== -1) {
      const key = kvp.key.replace('_array', '')
      const array = JSON.parse(kvp.value)

      decoded[key] = array.map(decodeEntity)

      delete decoded[kvp.key]
    } else if (kvp.key.indexOf('_date') !== -1) {
      const key = kvp.key.replace('_date', '')

      decoded[key] = new Date(kvp.value * 1000)

      delete decoded[kvp.key]
    }
  })

  return decoded
}

function encodeEntity(value) {
  const MyType = new protobuf.Type(getType(value))

  let i = 0
  Object.entries(value).forEach(entry => {
    const kvp = { key: entry[0], value: entry[1] }
    if (!kvp.value) return

    if (kvp.value.serializable) {
      MyType.add(new protobuf.Field(`${kvp.key}_encoded`, i++, 'bytes'))
      MyType.add(new protobuf.Field(`${kvp.key}_type`, i++, 'string'))
      MyType.add(new protobuf.Field(`${kvp.key}_fields`, i++, 'string'))

      const tuple = encodeEntity(kvp.value)
      value[`${kvp.key}_encoded`] = tuple.encoded
      value[`${kvp.key}_type`] = tuple.type
      value[`${kvp.key}_fields`] = JSON.stringify(tuple.fields)
    } else if (kvp.value.constructor.name === 'Array') {
      MyType.add(new protobuf.Field(`${kvp.key}_array`, i++, 'string'))

      const array = kvp.value.map(encodeEntity)
      value[`${kvp.key}_array`] = JSON.stringify(array)
    } else if (kvp.value.constructor.name === 'Date') {
      MyType.add(new protobuf.Field(`${kvp.key}_date`, i++, 'int32'))
      value[`${kvp.key}_date`] = kvp.value.getTime() / 1000
    } else {
      MyType.add(new protobuf.Field(kvp.key, i++, getType(kvp.value)))
    }
  })

  const encoded = MyType.encode(value).finish()
  const fields = Object.entries(MyType.fields).map(kvp => { return { name: kvp[0], id: kvp[1].id, type: kvp[1].type } })
  return { encoded, type: MyType.name, fields }
}

/*************
 * Bootstrap *
 *************/

const entity = new Foo()
console.log('Before:')
console.log(entity)

const encoded = encodeEntity(entity)
//console.log(encoded)

const decoded = decodeEntity(encoded)
console.log('After:')
console.log(decoded)
