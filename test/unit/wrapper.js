/*jshint -W068 */
/*jshint multistr: true */

require( "should" );

describe( "require wrapper", function () {
/**
 * @typedef module
 * @type {object}
 * @property {string} id - the identifier for the module.
 * @property {string} filename - the fully resolved filename to the module.
 * @property {module} parent - the module that required this one.
 * @property {module[]} children - the module objects required by this one.
 * @property {boolean} loaded - whether or not the module is done loading, or is in the process of loading
 */

  var log = [],
			/**
			 *
			 * Define scope for `require`
			 */
			require = (function(){
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
						_require = function( filename ) {

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
							imports[ filename ] = factories[ filename ]( require, module.exports, module );
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
				_require.def = function( filename, moduleFactory ) {
					factories[ filename ] = moduleFactory;
				};
				return _require;
			}());

  it("must resolve dependencies", function () {
		require.def( "/main.js", function( require, exports, module  ){
			var dep;
			log.push( "main-runs" );
			dep = require( "/dep.js" );
			log.push( "main-imports:" + dep.id );
			log.push( "dep-fChild-id:" + module.children[ 0 ].id );
			// Generated
			module.exports = JSON.stringify( exports ) === "{}" ? module.exports : exports;
			return module;
		});
		require.def( "/dep.js", function( require, exports, module  ){
			log.push( "dep-runs" );
			log.push( "dep-parent-id:" + module.parent.id );
			module.exports = { id: module.id };
			// Generated
			module.exports = JSON.stringify( exports ) === "{}" ? module.exports : exports;
			return module;
		});
		require( "/main.js" );
		log.should.eql([
			"main-runs",
			"dep-runs",
			"dep-parent-id:/main.js",
			"main-imports:/dep.js",
			"dep-fChild-id:/dep.js"
		]);

  });
});



