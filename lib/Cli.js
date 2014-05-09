/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

	/**
		* module Cli
		* @constructor
		* @alias module:Cli
		* @param {string} srcPath
		* @param {string} cwd
		* @param {function} fsContainer
		* @param {function} pathContainer
		*/
	module.exports = function( srcPath, cwd, fsContainer, pathContainer ) {
			var startTime = process.hrtime(),
					/**
					 * to resolve build path relative to source path
					 * @type {string}
					 */
					sourceMapRoot = "",
					/**
					* Relative path to sources e.g. for /home/user/src -> src
					* @type {string}
					*/
				 srcRelPath = srcPath.substr( cwd.length ).replace( /^\//, "" );

			// Dependency injection
			fsContainer = fsContainer || {};
			pathContainer = pathContainer || {};
			return {
				/**
				* Display header (copyright)
				*/
				printHeader: function() {
					console.log( " CommonJS Compiler " + this.getProjectInfo().version + " (https://github.com/dsheiko/cjsc) ");
				},
				/**
				* Display body
				* @param {number} counter
				*/
				printBody: function( counter ) {
					console.log( " \033[0;32m>>>\033[0m " + counter + " dependencies resolved" );
					console.log( " Compilation time: " + this.getElapsedTime() );
				},
				/**
				* Determine script execution time
				* @return {String}
				*/
				getElapsedTime: function() {
						var precision = 0,
								elapsed = process.hrtime( startTime )[ 1 ] / 1000000, // divide by a million to get nano to milli
						out = process.hrtime( startTime )[ 0 ] + "s, " + elapsed.toFixed( precision ) + "ms";
						startTime = process.hrtime(); // reset the timer
						return out;
				},
				/**
					* Get object with project info
					* @access public
					* @returns {Object}
					*/
				getProjectInfo: function() {
					var project, plain;
					try {
						plain = fsContainer.readFileSync( pathContainer.join( __dirname, "..", "package.json" ), "utf-8" );
						project = JSON.parse( plain );
					} catch ( e ) {
						throw new ReferenceError( "Cannot read package.json\n" );
					}
					return project;
				},
				/**
				*
				* @param {string} pathArg
				* @param {string} [calleePath]
				* @return {string}
				*/
				readJs: function( pathArg ) {
					if ( typeof pathArg !== "string" ) {
						throw new TypeError( "file path must be a string. " + typeof pathArg + " found" );
					}

					if ( !fsContainer.existsSync( pathArg ) || !fsContainer.statSync( pathArg ).isFile() ) {
						pathArg = pathArg + ".js";
						if ( !fsContainer.existsSync( pathArg ) || !fsContainer.statSync( pathArg ).isFile() ) {
							throw new ReferenceError( pathArg + " doesn't exist\n" );
						}
					}
					return fsContainer.readFileSync( pathArg, "utf-8" );
				},
				/**
				*
				* @param {string} file
				* @param {string} data
				*/
				writeJs: function( file, data ) {
					fsContainer.writeFileSync( file, data, "utf-8" );
				},
				/**
				* Resolve relative path relative to initial path (where main module located)
				* or relative to callee if any given
				* ('/foo/bar/filename.js', './baz') -> /foo/bar/baz
				* ('/foo/bar', './baz') -> /foo/bar/baz
				* ('/foo/bar', '/tmp/file/') -> /tmp/file/
				* @param {string} relPath
				* @param {string} [calleeFilename]
				* @return {string}
				*/
				resolveFilename: function( relPath, calleeFilename ) {
							/** @type {string} */
					var dirname = calleeFilename ? pathContainer.dirname( calleeFilename ) : srcPath,
							/** @type {string} */
							resolvedName = pathContainer.resolve( dirname, relPath );

					if ( !fsContainer.existsSync( resolvedName ) || !fsContainer.statSync( resolvedName ).isFile() ) {
						resolvedName = pathContainer.resolve( dirname, relPath + ".js" );
						if ( !fsContainer.existsSync( resolvedName ) || !fsContainer.statSync( resolvedName ).isFile() ) {
							throw new ReferenceError( "Could't resolve dependency `" + relPath + "` in `" + calleeFilename + "`" );
						}
					}
					// Cut the absolute path
					resolvedName = pathContainer.relative( cwd, resolvedName );
					return resolvedName;
				},
				/**
				 * Resolve the path given in config
				 * @param {string} relPath
				 * @returns {string}
				 */
				resolvePath: function( relPath ) {
					var path = pathContainer.resolve( relPath );
					if ( !fsContainer.existsSync( path ) || !fsContainer.statSync( path ).isFile() ) {
						path = pathContainer.resolve( relPath + ".js" );
						if ( !fsContainer.existsSync( path ) || !fsContainer.statSync( path ).isFile() ) {
							throw new ReferenceError( "Could't resolve dependency `" + path + "` specified in the configuration. " +
								"The path must be relative to the project directory (where the compiler is running from) " );
						}
					}
					return path;
				},
				/**
				 * Proxy path.dirname
				 * @param {string} filename
				 * @returns {string}
				 */
				getDirname: function( filename ) {
					return pathContainer.dirname( filename );
				},
				/**
					* Populate options with ones founds in args
					* @access public
					* @param {Array} args
					* @returns {Object}
					*/
				parseCliOptions: function( args ) {
					var options = {
								banner: "",
								"source-map": "",
								"source-map-url": "",
								"source-map-root": "",
								config: ""
							},
							reTrim = /^\s+|\s+$/g,
							reOption = /^--/g;
					args.slice( 2 ).forEach(function( arg ){
						var slices;
						// normalize: ltrim
						arg = arg.replace( reTrim, "" );
						if ( arg.indexOf( "--" ) === 0 ) {
							slices = arg.split( "=" );
							options[ slices[0].replace( reOption, "" ) ] = slices[ 1 ] || null;
						}
					});
					return options;
				},
				/**
				 * Get path relative to project dir
				 * @param {String} root
				 * @param {String} srcMapFile
				 */
				setSourceMapRoot: function( root, srcMapFile ){
					var rootResolved = pathContainer.join( pathContainer.dirname( srcMapFile ), root );
					if ( !fsContainer.existsSync( rootResolved ) ) {
						throw new Error( "Source map root  `" + rootResolved + "` doesn't exist" );
					}
					sourceMapRoot = root;
				},
				/**
				 * If source map root given, resolve files paths:
				 * root = `build/map/`
				 * sources at `src`
				 * file = `src/Folder/File.js`
				 * resolved: `build/map/Folder/File.js`
				 * @param {String} filename
				 * @returns {String}
				 */
				resolveRelativeScrPath: function( filename ){
					return sourceMapRoot ? pathContainer.join( sourceMapRoot, filename.substr( srcRelPath.length ) ) : filename;
				}

			};
		};
