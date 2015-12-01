# CHANGELOG

## R1.0.7
* Documented: how to use babelify transformer to transpile ES6/2015 into ES5 during packaging

## R1.0.3
* __modulename now resolved relative to the source file

## R1.0.2
* Every compiled code now has own scope
* FileSystem lib was resolving source map path incorrect

## R1.0.1
* Hotfix: R1.0.0 was resolving _require dependences by ids,
therefore same relative names were resolved incorrectly

## R1.0.0
* Fully refactored
* Adding plugins via --plugin=<nodePackage,nodePackage>
* Adding transformers via -t {nodePackage --option 1 --options { foo: 1} }
* Supports [Browserify plugins](https://www.npmjs.com/browse/keyword/browserify-plugin) (transformers)
* Asynchronous source files reading in one pass-through
* Added package 'subarg' for handling CLI arguments
* Added package 'cli-color' for coloring CLI
* Added package 'async' for resolving async queues
* Added package 'xtend' for extending objects
