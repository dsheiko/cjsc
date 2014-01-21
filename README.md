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

