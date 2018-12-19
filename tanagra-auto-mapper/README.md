# tanagra

A simple, lightweight node.js serialization library supporting ES6 classes (including Maps).
Currently serializes to both JSON and Google Protobuf formats.

## Overview

This experimental extension walks the module tree in _node.js_ to build up a map of classes,
meaning the user doesn't have to specify the type to deserialize to.

## Installation

```bash
$ npm add --save tanagra-auto-mapper
```

## Usage

```javascript
const generateTypeMap = require('tanagra-auto-mapper').generateTypeMap
const json = require('tanagra-json')

json.init(generateTypeMap(module))

const encoded = json.encodeEntity(new Foo())
const decoded = json.decodeEntity(encoded)
```
