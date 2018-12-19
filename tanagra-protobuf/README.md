# tanagra

A simple, lightweight node.js serialization library supporting ES6 classes (including Maps).

## Overview

The _tanagra_ project aims to provide javascript developers with the ability to serialize complex,
nested classes into a format which can be transmitted over a network or stored in a
datastore such as _redis_. The deserialized objects contain all the data and functions of
the original classes, allowing them to be used in code as the originals were. The library requires
only standard Javascript (currently tested with ES6 and node.js), with no dependency on experimental
features, _Babel_ transpiling or _TypeScript_.

## Architecture

To use _tanagra_ to serialize to the _Google Protocol Buffers_ format, you need the following modules:

- `tanagra-core` - common functionality required by the different serialization formats,
  including the function for marking classes as _serializable_
- `tanagra-protobuf` - the _Google Protocol Buffers_ serializer

Note that the protobuf serializer is experimental, and contains some bugs around handling
arrays and ES6 maps.

## Installation

```bash
$ npm add --save tanagra-protobuf
```

## Usage

The following example declares a serializable class using `tanagra-core`, and then
serializes/deserializes it:

```javascript
const serializable = require('tanagra-core').serializable

class Foo {
  constructor(bar, baz) {
    this.someNumber = 123
    this.someString = 'hello, world!'
    this.bar = bar // a complex object with a prototype
    this.baz = baz // a complex object with a prototype
  }
}

// Mark class `Foo` as serializable and containing sub-types `Bar` and `Baz`
module.exports = serializable(Foo, [Bar, Baz])

...

const json = require('tanagra-protobuf')
await json.init()

const foo = new Foo(bar, baz)
const encoded = json.encodeEntity(foo)

...

const decoded = json.decodeEntity(encoded, Foo)

```
