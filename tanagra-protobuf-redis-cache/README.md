# tanagra

A simple, lightweight node.js serialization library supporting ES6 classes (including Maps).
Currently serializes to both JSON and Google Protobuf formats.

## Overview

This helper library saves the serialized output of `tanagra-protobuf` to _redis_,
including the schema information used in deserializing the data.

## Installation

```bash
$ npm add --save tanagra-protobuf-redis-cache
```

## Usage

```javascript
const redis = require('redis')
const protobuf = require('tanagra-protobuf')
const redisCache = require('tanagra-protobuf-redis-cache')

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
})

const foo = new Foo()
const encoded = protobuf.encodeEntity(foo)
await redisCache.set(redisClient, 'foo', encoded)

...

const fromRedis = await redisCache.get(redisClient, 'foo')
const decoded = protobuf.decodeEntity(fromRedis, Foo)
```
