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
				imports[ filename ] = factories[ filename ]( _require, module.exports, module );
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
_require.def( "test/integration/fixtures/dependency-config/require-b/main.js", function( _require, exports, module ){
var globalA = _require( "globalA" ),
		globalB = _require( "globalB" ),
		mod = _require( "test/integration/fixtures/dependency-config/require-b/3rd-party-code.js" );

window.log.push( JSON.stringify( mod ) );


	return module;
});

_require.def( "globalA", function( _require, exports, module ){
	module.exports = window.globalA;

	return module;
});

_require.def( "globalB", function( _require, exports, module ){
	module.exports = window.globalB;

	return module;
});

_require.def( "test/integration/fixtures/dependency-config/require-b/3rd-party-code.js", function( _require, exports, module ){

 var 
	/** @type {module:globalA} */
	globalA = _require( "globalA" ),

	/** @type {module:globalB} */
	globalB = _require( "globalB" );
window.globalC =  "globalC + " + globalA;
window.globalD =  "globalD + " + globalB;
	module.exports.globalC = globalC;
	module.exports.globalD = globalD;
	return module;
});

_require( "test/integration/fixtures/dependency-config/require-b/main.js" );
