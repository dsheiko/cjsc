CommonJS Compiler
==============

CommonJS Compiler compiles CommonJS modules into a a single JavaScript file suitable for  browser.

Features

* Allows to keep JavaScript modular in a common way
* Adds no extra code, but tiny `require` function and definition wrappers
* Supports UMD

## How to install

CommonJS Compiler relies on node.js. If you don't have node.js installed, just follow the instructions:
https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager

Make sure all the required dependencies installed
```bash
npm i
```
Make sure the binary is executable
```bash
chmod +x cjsc
```
You can also create a symlink to make it globally available
```bash
ln -s cjsc /usr/local/bin/cjsc
```

## How it works

Let's define a few CommonJS modules (http://wiki.commonjs.org/wiki/Modules/1.1.1):

`./main.js`
```javascript
console.log( "main.js running..." );
console.log( "Imported name in main.js is `%s`", require( "./lib/dep1" ).name );
```

`./lib/dep1.js`
```javascript
console.log( "dep1.js running..." );
console.log( "Imported name in dep1.js is `%s`", require( "./dep2" ).name );
exports.name = "dep1";
```

`./lib/dep2.js`
```javascript
console.log( "dep2.js running..." );
exports.name = "dep2";
```

Now we can compile the modules:
```bash
cjsc main.js script.js
```

As we fire up script.js we get the following output:
```
main.js running...
dep1.js running...
dep2.js running...
Imported name in dep1.js is `dep2`
Imported name in main.js is `dep1`
```

## The `module` object
Every module has available `module` variable that references to an object representing the module.
Like in [NodeJS](http://nodejs.org/api/modules.html) th object has following structure:

* module.id {string} - The identifier for the module.
* module.filename {string} - The fully resolved filename to the module.
* module.loaded {boolean} - Whether or not the module is done loading.
* module.parent {Object} - The module that required this one.
* module.children {Object[]} - The module objects required by this one