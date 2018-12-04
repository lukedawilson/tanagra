const protobuf = require('protobufjs')
const util = require('util')

const loadAsync = util.promisify(protobuf.load)

function deserializeMap(mapFieldName, result, serializable) {
  const map = new Map()
  result[mapFieldName].forEach(kvp => {
    // Set prototypes on kvp's key and value
    if (kvp._keySerializationKey) {
      const proto = serializable.get(kvp._keySerializationKey)
      if (proto) {
        Object.setPrototypeOf(kvp.key, proto)
      }
    }

    if (kvp._valueSerializationKey) {
      const proto = serializable.get(kvp._valueSerializationKey)
      if (proto) {
        Object.setPrototypeOf(kvp.value, proto)
      }
    }

    // Add entry to map
    map.set(kvp.key, kvp.value)
  })

  const originalKey = mapFieldName.replace('_map', '')
  result[originalKey] = map

  delete result[mapFieldName]
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
      const proto = serializable.get(result._serializationKey)
      if (proto) {
        Object.setPrototypeOf(result, proto)
      }
    }

    // Handle maps as a special case
    Object.getOwnPropertyNames(result)
      .filter(property => property.indexOf('_map') !== -1)
      .forEach(property => deserializeMap(property, result, serializable))

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
