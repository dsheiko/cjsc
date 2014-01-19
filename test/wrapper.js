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
						* Store types assigned to module.exports
						* @type {module[]}
						*/
						imports = [],
						/**
						 * Store the code that constract module (and assigns to exports)
						 * @type {*[]}
						 */
						constructors = [],
						/**
						 * @type {module}
						 */
						module = {},
						/**
						 * Implement CommonJS `require`
						 * @param {string} filename
						 * @returns {*}
						 */
						require = function( filename ) {

							if ( typeof imports[ filename ] !== "undefined" ) {
								return imports[ filename ].exports;
							}
							module = {
								id: filename,
								filename: filename,
								parent: module,
								children: [],
								exports: null,
								loaded: false
							};

							// Called first time, so let's run code constructing (exporting) the module
							if ( typeof constructors[ filename ] === "undefined" ) {
								throw new Error( "Constructor of " + filename + " module not found" );
							}
							imports[ filename ] = constructors[ filename ]( module, module.exports );
							imports[ filename ].loaded = true;
							if ( imports[ filename ].parent.children ) {
								imports[ filename ].parent.children.push( imports[ filename ] );
							}
							return imports[ filename ].exports;
						};
				/**
				 * Register module
				 * @param {string} filename
				 * @param {function(module, *)} constructFn
				 */
				require.define = function( filename, constructFn ) {
					constructors[ filename ] = constructFn;
				};
				return require;
			}());

  it("must resolve dependencies", function () {
		require.define( "/main.js", function( module ){
			var dep;
			log.push( "main-runs" );
			dep = require( "/dep.js" );
			log.push( "main-imports:" + dep.id );
			log.push( "dep-fChild-id:" + module.children[ 0 ].id );
			return module;
		});
		require.define( "/dep.js", function( module ){
			log.push( "dep-runs" );
			log.push( "dep-parent-id:" + module.parent.id );
			module.exports = { id: module.id };
			return module;
		});
		require( "/main.js" );
		log.should.eql([
			'main-runs',
			'dep-runs',
			'dep-parent-id:/main.js',
			'main-imports:/dep.js',
			'dep-fChild-id:/dep.js'
		]);

  });
});



