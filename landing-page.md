<script async defer src="https://buttons.github.io/buttons.js"></script>

# tanagra.js

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

A simple, lightweight node.js serialization library supporting ES6 classes
(including Map, Buffer and Uint8Array). Serializes to JSON by default,
but can be extended to support other formats.

## Overview

The _tanagra.js_ project aims to provide javascript developers with the ability to serialize complex,
nested classes into a format which can be transmitted over a network or stored in a
datastore such as _redis_. The deserialized objects contain all the data and functions of
the original classes, allowing them to be used in code as the originals were. The library requires
only standard Javascript (currently tested with ES6 and node.js), with no dependency on experimental
features or _Babel_ transpiling.

Both vanilla JS and Typescript are supported.

The npm packages can be found [here](https://www.npmjs.com/package/tanagra).

## Project structure

The project is divided into a number of modules:

- [tanagra-core](module-tanagra-core.html) - common functionality required by the different serialization formats,
  including the function for marking classes as _serializable_
- [tanagra-json](module-tanagra-json.html) - serializes the data into `JSON` format

## Installation

```bash
$ npm add --save tanagra-core
$ npm add --save tanagra-json
```

Alternatively, to install the packages required for JSON serialization:

```bash
$ npm add --save tanagra
```

## Basic usage

The following example declares a serializable class, and uses the `tanagra-json` module
to serialize/deserialize it.

### Vanilla JS

```javascript
// ------ foo.js ------

const serializable = require('tanagra-core').serializable

module.exports = serializable()(class Foo {
  constructor(
    bar,
    baz1,
    baz2,
    fooBar1,
    fooBar2
  ) {
    this.someNumber = 123
    this.someString = 'hello, world!'
    this.bar = bar // a complex object with a prototype
    this.bazArray = [baz1, baz2]
    this.fooBarMap = new Map([
      ['a', fooBar1],
      ['b', fooBar2]
    ])
  }
})

// ------ ------ ------

const json = require('tanagra-json')

const foo = new Foo(bar, baz)
const encoded = json.encodeEntity(foo)

// ------ ------ ------

const decoded = json.decodeEntity(encoded)
```

### Typescript

```typescript
// ------ foo.ts ------

import { serializable } from 'tanagra-core'

export default serializable()(class Foo {
  constructor(
    bar: Bar,
    baz1: Baz,
    baz2: Baz,
    fooBar1: FooBar,
    fooBar2: FooBar
  ) {
    this.someNumber = 123
    this.someString = 'hello, world!'
    this.bar = bar // a complex object with a prototype
    this.bazArray = [baz1, baz2]
    this.fooBarMap = new Map([
      ['a', fooBar1],
      ['b', fooBar2]
    ])
  }
})

// ------ ------ ------

import { encodeEntity } from 'tanagra-json'

const foo = new Foo(bar, baz)
const encoded = encodeEntity(foo)

// ------ ------ ------

const decoded = decodeEntity<Foo>(encoded)
```

## Contributing

I welcome contributions to the project. You might want to start with some
[n00b issues](https://github.com/lukedawilson/tanagra/labels/good%20first%20issue).
If you do pick up an issue, you can [email me](mailto:luke.d.a.wilson@gmail.com) to let me know you're working on it,
to avoid duplication.

## Roadmap

- Better handling of dynamic changes to class structure at runtime
- Support for client-side Javascript
- Full support for Google protobufs (including caching in Redis)
- Better support for pre-ES6 data-structures (functions-as-classes)
