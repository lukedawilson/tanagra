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

To use _tanagra_ to serialize to JSON format, you need the following modules:

- `tanagra-core` - common functionality required by the different serialization formats,
  including the function for marking classes as _serializable_
- `tanagra-json` - the JSON serializer

## Installation

```bash
$ npm add --save tanagra-json
```

## Usage

The following example declares a serializable class using `tanagra-core`, and then
serializes/deserializes it:

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

// Mark class `Foo` as serializable and containing sub-types `Bar`, `Baz` and `FooBar`
module.exports = serializable(Foo, [Bar, Baz, FooBar])

...

const json = require('tanagra-json')
json.init()

const foo = new Foo(bar, baz)
const encoded = json.encodeEntity(foo)

...

const decoded = json.decodeEntity(encoded, Foo)

```
