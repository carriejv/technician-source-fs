# @technician/source-fs

[![npm version](https://img.shields.io/npm/v/@technician/source-fs.svg)](https://www.npmjs.com/package/@technician/source-fs) [![npm downloads](https://img.shields.io/npm/dt/@technician/source-fs)](https://www.npmjs.com/package/@technician/source-fs) [![npm license](https://img.shields.io/npm/l/@technician/source-fs.svg)](https://www.npmjs.com/package/@technician/source-fs)

[![dependencies](https://img.shields.io/david/carriejv/technician-source-fs.svg)](https://david-dm.org/carriejv/technician-source-fs) [![Build Status](https://github.com/carriejv/technician-env-config-source/workflows/ci-build/badge.svg?branch=master)](https://github.com/carriejv/technician-env-config-source/actions?query=workflow%3Aci-build) [![GitKraken](https://img.shields.io/badge/<3-GitKraken-green.svg)](https://www.gitkraken.com/invite/om4Du5zG)

A config source for accessing config stored on the filesystem, allowing access to several config files stored in the same directory. It useable as both an async and sync config source.

This package provides the `FSConfigSource` for use with the [Technician](https://www.npmjs.com/package/technician) manager.

[![Technician](https://img.shields.io/npm/v/technician?label=technician)](https://www.npmjs.com/package/technician)

## Installation

`npm i @technician/source-fs`

This package is compatible with Node 10 LTS and up.

## Usage Examples

`FSConfigSource` returns `Buffer` data by default and uses filenames as keys.

### The Basics
```ts
import {Technician} from 'technician';
import {FSConfigSource} from '@technician/source-fs'

const technician = new Technician(new FSConfigSource());

// By default, FSConfigSource reads from process.cwd();
await technician.read('.myapprc');
await technician.read('something-else.json');
```

### Working With JSON
```ts
import {Technician, Interpret} from 'technician';
import {FSConfigSource} from '@technician/source-fs'

const technician = new Technician(Interpret.buffer.asJSON(new FSConfigSource(), 'utf8'));
const config = await technician.read('config.json');

// The default asJSON interpreter can read and return JSON files as a js object.
// Non-JSON will be ignored with `asJSON`.
// You can use `asStringOrJSON` to parse JSON only when valid and otherwise return strings.
db.connect(config.dbUsername, config.dbPassword);
```

### Specifying Directories
```ts
// Provide an absolute path to a directory.
new FSConfigSource('/home/me/my-config-dir');

// The relativeRootPath option will look inside process.cwd() for your custom path.
new FSConfigSource('app-config-dir', {relativeRootPath: true});
```

### Recursive Reading
```ts
// Recursively reads subdirectories.
technician.addSource(new FSConfigSource(), {recurse: true});

// Read a file at the top level...
await technician.read('top-level-file.txt');
// ... or within nested subdirectories
await technician.read('subdirectory/another-file.txt');

// Subdirectories are not expanded into objects with readAll(),
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