# @technician/fs-config-source

[![npm version](https://img.shields.io/npm/v/@technician/fs-config-source.svg)](https://www.npmjs.com/package/@technician/fs-config-source) [![npm downloads](https://img.shields.io/npm/dt/@technician/fs-config-source)](https://www.npmjs.com/package/@technician/fs-config-source) [![npm license](https://img.shields.io/npm/l/@technician/fs-config-source.svg)](https://www.npmjs.com/package/@technician/fs-config-source)

[![dependencies](https://img.shields.io/david/carriejv/technician-fs-config-source.svg)](https://david-dm.org/carriejv/technician-fs-config-source) [![Build Status](https://img.shields.io/travis/com/carriejv/technician-fs-config-source.svg)](https://travis-ci.com/carriejv/technician-fs-config-source) [![GitKraken](https://img.shields.io/badge/<3-GitKraken-green.svg)](https://www.gitkraken.com/invite/om4Du5zG)

A config source for accessing config stored on the filesystem.

The FSConfigSource accesses the contents of an entire directory, allowing access to several config files stored in the same location. It useable as both an async and sync config source.

This package provides the `FSConfigSource` for use with the [Technician](https://www.npmjs.com/package/technician) manager.

[![Technician](https://img.shields.io/npm/v/technician?label=technician)](https://www.npmjs.com/package/technician)

## Installation

`npm i @technician/fs-config-source`

This package is compatible with Node 10 LTS and up.

## Usage Examples

### The Basics
```ts
import {Technician, DefaultInterpreters} from 'technician';
import {FSConfigSource} from '@technician/fs-config-source'

const technician = new Technician(DefaultInterpreters.asText('utf8'));
technician.addSource(new FSConfigSource());

// By default, FSConfigSource reads from process.cwd();
await technician.read('.myapprc');
await technician.read('something-else.json');
```

### Working With JSON
```ts
import {Technician, DefaultInterpreters} from 'technician';
import {FSConfigSource} from '@technician/fs-config-source'

const technician = new Technician(DefaultInterpreters.asJSON('utf8'));
technician.addSource(new FSConfigSource());

const config = await technician.read('config.json');

// The default asJSON interpreter can read and return JSON files as a js object.
// Non-JSON will be ignored with `asJSON`.
// You can use `asTextOrJSON` to optionally parse only valid JSON.
db.connect(config.dbUsername, config.dbPassword);
```

### Specifying Directories
```ts
// ...

// Provide an absolute path to a directory.
technician.addSource(new FSConfigSource('/home/me/my-config-dir'));

// The relativeRootPath option will look inside process.cwd() for your custom path.
technician.addSource(new FSConfigSource('app-config-dir', {relativeRootPath: true}));

// ...
```

### Recursive Reading
```ts
// ...

// Allows recursive access to subdirectories.
technician.addSource(new FSConfigSource(), {recurse: true});

// Read a file at the top level...
await technician.read('top-level-file.txt');
// ... or within nested subdirectories
await technician.read('subdirectory/another-file.txt');

// Note that subdirectories are not expanded into objects with readAll(),
// but instead keep the same flat key structure used by read().

// Ex: {"top-level-file.txt": "contents", "subdirectory/another-file.txt": "contents"}
```

## Errors

By default, the FSConfigSource suppresses all filesystem errors (except in the case that the `rootPath` passed to the constructor is invalid), instead treating any unreadable files as simply nonexistent.

To throw these errors instead, use the `{throwErrors: true}` option. Note that this will cause `readAll()` to throw an error if the target directory contains any inaccessible files, even if others are valid.

## Contributions

Contributions and pull requests are always welcome. Please be sure your code passes all existing tests and linting.

Pull requests with full code coverage are strongly encouraged.

## License

[Apache-2.0](https://github.com/carriejv/technician/blob/master/LICENSE)