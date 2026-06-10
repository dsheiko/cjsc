# CHANGELOG

## 2.0.0 (2026-06-10)

Breaking changes and full modernization.

**Dependencies**
- Updated `async` ^1.5 → ^3.2 (compatible API)
- Updated `cli-color` ^0.3 → ^2.0
- Updated `esprima` ^2.7 → ^4.0 (ES2018 support, `parseScript` API)
- Updated `source-map` to ^0.7
- Updated `uglify-js` ^2 → ^3 (auto-detects input type, removed `fromString` option)
- Removed `xtend` (replaced with `Object.assign`)
- Removed `through2` from test fixtures (replaced with native `stream.Transform`)

**Test tooling**
- Replaced Grunt + Mocha + QUnit + JSHint + JSCS with Jest
- Unit tests rewritten under `tests/unit/`
- Integration tests converted from browser QUnit to Node.js `vm` + Jest
- Removed `bower.json`, `Gruntfile.js`, `.jscsrc`, `.jshintrc`, `.travis.yml`
- New npm scripts: `test`, `test:watch`, `test:coverage`

**CI**
- Replaced Travis CI with GitHub Actions workflow
- Tests run on Node.js 18, 20, and 22

**Source fixes**
- Moved `"use strict"` to top of all modules (was after `var` declarations)
- Removed `util.isArray` (now uses `Array.isArray`)
- Removed unused `util` import from `Cli.js`
- Fixed stream option `bufferSize` → `highWaterMark` (deprecated Node.js stream option)
- Used `esprima.parseScript` instead of deprecated `esprima.parse`

---

## R1.0.7
- Documented: how to use babelify transformer to transpile ES6/2015 into ES5

## R1.0.3
- `__modulename` now resolved relative to the source file

## R1.0.2
- Every compiled module now has its own scope
- Fixed FileSystem source map path resolution

## R1.0.1
- Hotfix: R1.0.0 was resolving `_require` dependencies by ids, causing incorrect resolution for same relative names

## R1.0.0
- Full refactor with plugin/transformer support
- Async source file reading in one pass
- Added: subarg, cli-color, async, xtend
- Supports Browserify transform plugins
