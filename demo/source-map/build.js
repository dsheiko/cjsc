/* jshint unused: false */
/**
 * @typedef module
 * @type {object}
 * @property {string} id - the identifier for the module.
 * @property {string} filename - the fully resolved filename to the module.
 * @property {module} parent - the module that required this one.
 * @property {module[]} children - the module objects required by this one.
 * @property {boolean} loaded - whether or not the module is done loading, or is in the process of loading
 */
/**
	*
	* Define scope for `require`
	*/
var _require = (function(){
	var /**
			* Store modules (types assigned to module.exports)
			* @type {module[]}
			*/
			imports = [],
			/**
			 * Store the code that constructs a module (and assigns to exports)
			 * @type {*[]}
			 */
			factories = [],
			/**
			 * @type {module}
			 */
			module = {},
			/**
			 * Implement CommonJS `require`
			 * http://wiki.commonjs.org/wiki/Modules/1.1.1
			 * @param {string} filename
			 * @returns {*}
			 */
			__require = function( filename ) {

				if ( typeof imports[ filename ] !== "undefined" ) {
					return imports[ filename ].exports;
				}
				module = {
					id: filename,
					filename: filename,
					parent: module,
					children: [],
					exports: {},
					loaded: false
				};
				if ( typeof factories[ filename ] === "undefined" ) {
					throw new Error( "The factory of " + filename + " module not found" );
				}
				// Called first time, so let's run code constructing (exporting) the module
				imports[ filename ] = factories[ filename ]( _require, module.exports, module,
          typeof window !== "undefined" ? window : global );
				imports[ filename ].loaded = true;
				if ( imports[ filename ].parent.children ) {
					imports[ filename ].parent.children.push( imports[ filename ] );
				}
				return imports[ filename ].exports;
			};
	/**
	 * Register module
	 * @param {string} filename
	 * @param {function(module, *)} moduleFactory
	 */
	__require.def = function( filename, moduleFactory ) {
		factories[ filename ] = moduleFactory;
	};
	return __require;
}());
// Must run for UMD, but under CommonJS do not conflict with global require
if ( typeof require === "undefined" ) {
	require = _require;
}
_require.def( "demo/source-map/src/use-main-flow.js", function( _require, exports, module, global ){
console.log( "main.js running..." );
console.log( "Imported name in main.js is `%s`", _require( "demo/source-map/src/main-flow/dep1.js" ).name );
console.log( "Getting imported object from the cache:" );
console.log( " imported name in main.js is still `%s`", _require( "demo/source-map/src/main-flow/dep1.js" ).name );
  return module;
});

_require.def( "demo/source-map/src/main-flow/dep1.js", function( _require, exports, module, global ){
  var __dirname = "demo/source-map/src/main-flow", __filename = "demo/source-map/src/main-flow/dep1.js";
console.log( "dep1.js running..." );
console.log( " it has __diname = `%s`", __dirname );
console.log( " it has __filename = `%s`", __filename );
console.log( "Imported name in dep1.js is `%s`", _require( "demo/source-map/src/main-flow/dep2.js" ).name );
exports.name = "dep1";
  module.exports = exports;

  return module;
});

_require.def( "demo/source-map/src/main-flow/dep2.js", function( _require, exports, module, global ){
console.log( "dep2.js running..." );
module.exports.name = "dep2";

  return module;
});

(function(){
_require( "demo/source-map/src/use-main-flow.js" );
}());

//# sourceMappingURL=./build.js.map