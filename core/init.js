const protobuf = require('protobufjs')
const util = require('util')

const loadAsync = util.promisify(protobuf.load)

function deserializeMap(kvp, result) {
  const map = new Map()
  result[kvp.key].forEach(kvp2 => map.set(kvp2.key, kvp2.value))

  const originalKey = kvp.key.replace('_map', '')
  result[originalKey] = map

  delete result[kvp.key]
}

function setClazz(serializable) {
  return function(clazz) {
    if (clazz) {
      this.clazz = clazz
      serializable.set(clazz._serializationKey, clazz.prototype)
    }
  }
}

function get(serializable) {
  const _super = protobuf.Type.prototype.get

  return function (name) {
    const type = _super.call(this, name)

    if (this.clazz && this.clazz._fieldTypes) {
      if (type) {
        type.clazz = this.clazz._fieldTypes.get(name)
      }

      Array.from(this.clazz._fieldTypes.keys())
        .forEach(key => serializable.set(key, this.clazz._fieldTypes.get(key).prototype))
    }

    return type
  }
}

function decode(serializable) {
  const _super = protobuf.Type.prototype.decode

  return function(reader, length) {
    const result = _super.call(this, reader, length)

    // Set prototype, which contains fields, getters, static members
    if (result._serializationKey) {
      if (result.constructor.name === 'KeyValuePair') {
        if (result._keySerializationKey) {
          const proto = serializable.get(result._keySerializationKey)
          if (proto) {
            Object.setPrototypeOf(result.key, proto)
          }
        }

        if (result._valueSerializationKey) {
          const proto = serializable.get(result._valueSerializationKey)
          if (proto) {
            Object.setPrototypeOf(result.value, proto)
          }
        }
      } else {
        const proto = serializable.get(result._serializationKey)
        if (proto) {
          Object.setPrototypeOf(result, proto)
        }
      }
    }

    // Handle maps as a special case
    Object.entries(result)
      .map(entry => ({ key: entry[0], value: entry[1]}))
      .filter(kvp => kvp.key.indexOf('_map') !== -1)
      .forEach(kvp => deserializeMap(kvp, result))

    return result
  }
}

module.exports = async (descriptorProtoFilePath, serializable) => {
  serializable = serializable || new Map()

  // Load protodefs for serialising protobuf schemas
  const root = await loadAsync(descriptorProtoFilePath)
  global.protobuf = { Type: root.lookupType('Type') }

  // Extend Type proto, adding hooks for type map
  protobuf.Type.prototype.setClazz = setClazz(serializable)
  protobuf.Type.prototype.get = get(serializable)
  protobuf.Type.prototype.decode = decode(serializable)
}
