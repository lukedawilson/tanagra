# tanagra.js

![Shaka, When the Walls Fell](https://i.imgur.com/ejkP6Rvm.jpg)

A simple, lightweight node.js serialization library supporting ES6 classes (including Maps).
Currently serializes to both JSON and Google Protobuf formats.

## Overview

The _tanagra.js_ project aims to provide javascript developers with the ability to serialize complex,
nested classes into a format which can be transmitted over a network or stored in a
datastore such as _redis_. The deserialized objects contain all the data and functions of
the original classes, allowing them to be used in code as the originals were. The library requires
only standard Javascript (currently tested with ES6 and node.js), with no dependency on experimental
features, _Babel_ transpiling or _TypeScript_.

The project website and API documentation can be found [here](http://tanagrajs.net).

The npm packages can be found [here](https://www.npmjs.com/package/tanagra).

## Project structure

The project is divided into a number of modules:

- [tanagra-core](https://www.npmjs.com/package/tanagra-core) - common functionality required by the different
  serialization formats, including the function for marking classes as _serializable_
- [tanagra-json](https://www.npmjs.com/package/tanagra-json) - serializes the data into `JSON` format
- [tanagra-protobuf](https://www.npmjs.com/package/tanagra-protobuf) - serializes the data into `Google protobuffers`
  format (experimental)
- [tanagra-protobuf-redis-cache](https://www.npmjs.com/package/tanagra-protobuf-redis-cache) - a helper library
  for storing serialized protobufs in _redis_
- [tanagra-auto-mapper](https://www.npmjs.com/package/tanagra-auto-mapper) - walks the module tree in _node.js_
  to build up a map of classes, meaning the user doesn't have to specify the type to deserialize to (experimental)

## Installation

```bash
$ npm add --save tanagra-core
$ npm add --save tanagra-json
$ npm add --save tanagra-protobuf
$ npm add --save tanagra-protobuf-redis-cache
$ npm add --save tanagra-auto-mapper
```

Alternatively, to install the packages required for default (JSON) serialization:

```bash
$ npm add --save tanagra
```

## Basic usage

The following example declares a serializable class, and uses the `tanagra-json` module
to serialize/deserialize it:

```javascript
const serializable = require('tanagra-core').serializable

class Foo {
  constructor(bar, baz1, baz2, fooBar1, fooBar2) {
    this.someNumber = 123
    this.someString = 'hello, world!'
    this.bar = bar // a complex object with a prototype
    this.bazArray = [baz1, baz2]
    this.fooBarMap = new Map([
      ['a', fooBar1],
      ['b', fooBar2]
    ])
  }
}

// Mark class `Foo` as serializable and containing sub-types `Bar` and `Baz`
module.exports = serializable(Foo, [Bar, Baz], [
  // previous versions of the class
  [Bar, Baz, FooBar], // this version also references FooBar
  [FooBarBaz]         // this version references a different type altogether, FooBarBaz
])

// Encode with json

const json = require('tanagra-json')
const foo = new Foo(bar, baz)
const encoded = json.encodeEntity(foo)

// Alternatively, encode with protobufs

const protobuf = require('tanagra-protobuf')
await protobuf.init()
const foo = new Foo(bar, baz)
const encoded = protobuf.encodeEntity(foo)

// Decode

const decoded = json.decodeEntity(encoded) // or protobuf.decodeEntity(encoded)
```

## Contributing

I welcome contributions to the project. You might want to start with some
[n00b issues](https://github.com/lukedawilson/tanagra/labels/good%20first%20issue).
If you do pick up an issue, you can [email me](mailto:luke.d.a.wilson@gmail.com) to let me know you're working on it,
to avoid duplication.

## Roadmap

- Better handling of dynamic changes to class structure at runtime
- Better support for pre-ES6 data-structures (functions-as-classes)
- Full support for Google protobufs (including caching in Redis)
- Support for client-side Javascript
- Support for ESNext decorators
- Support for Typescript
