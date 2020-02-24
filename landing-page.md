<script async defer src="https://buttons.github.io/buttons.js"></script>

# tanagra

<a class="github-button"
   href="https://github.com/lukedawilson/tanagra/subscription"
   data-icon="octicon-eye"
   aria-label="Watch lukedawilson/tanagra on GitHub">Watch</a>
<a class="github-button"
   href="https://github.com/lukedawilson/tanagra"
   data-icon="octicon-star"
   aria-label="Star lukedawilson/tanagra on GitHub">Star</a>
<a class="github-button"
   href="https://github.com/lukedawilson/tanagra/issues"
   data-icon="octicon-issue-opened"
   aria-label="Issue lukedawilson/tanagra on GitHub">Issue</a>

![Shaka, When the Walls Fell](https://i.imgur.com/ejkP6Rvm.jpg)

A simple, lightweight node.js serialization library supporting ES6 classes (including Maps).
Currently serializes to both JSON and Google Protobuf formats.

## Overview

The _tanagra_ project aims to provide javascript developers with the ability to serialize complex,
nested classes into a format which can be transmitted over a network or stored in a
datastore such as _redis_. The deserialized objects contain all the data and functions of
the original classes, allowing them to be used in code as the originals were. The library requires
only standard Javascript (currently tested with ES6 and node.js), with no dependency on experimental
features, _Babel_ transpiling or _TypeScript_.

## Project structure

The project is divided into a number of modules:

- [tanagra-core](module-tanagra-core.html) - common functionality required by the different serialization formats,
  including the function for marking classes as _serializable_
- [tanagra-json](module-tanagra-json.html) - serializes the data into `JSON` format
- [tanagra-protobuf](module-tanagra-protobuf.html) - serializes the data into `Google protobuffers` format (experimental)
- [tanagra-protobuf-redis-cache](module-tanagra-protobuf-redis-cache.html) - a helper library for storing serialized protobufs in _redis_
- [tanagra-auto-mapper](module-tanagra-auto-mapper.html) - walks the module tree in _node.js_ to build up a map of classes,
  meaning the user doesn't have to specify the type to deserialize to (experimental)

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

// Mark class `Foo` as serializable and containing sub-types `Bar`, `Baz` and `FooBar`
module.exports = serializable(Foo, [Bar, Baz, FooBar])

...

const json = require('tanagra-json') // alternatively, `require('tanagra-protobuf')`
json.init()                          // `await json.init()` if you're using `tanagra-protobuf`

const foo = new Foo(bar, baz)
const encoded = json.encodeEntity(foo)

...

const decoded = json.decodeEntity(encoded, Foo)

```

## Bug reports and feature requests

Can be filed via [GitHub](https://github.com/lukedawilson/tanagra/issues/new/choose).

## Contributing

I welcome contributions to the project. You might want to start with some
[n00b issues](https://github.com/lukedawilson/tanagra/labels/good%20first%20issue).
Otherwise, just [browse the issues](https://github.com/lukedawilson/tanagra/issues) and pick one.
You might want to [email me](mailto:luke.d.a.wilson@gmail.com) to let me know you're working on it.
