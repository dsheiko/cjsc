# CHANGELOG

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
