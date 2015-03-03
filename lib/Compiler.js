/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

/**
 * @typedef dependencyMapDto
 * @type {object} - key-value object where value is an array of depEntity
 */

	/**
		* @module Compiler
		* @constructor
		* @alias module:Compiler
		* @param {Parser} parser
		* @param {Cli} cli
		* @param {config} config
		*/
	module.exports = function( parser, cli, config ) {
		"use strict";
				/**
				 * Map callee filenames to the dependency array
				 * { filename: DependencyEntity[] }
				 * @access private
				 * @type {dependencyMapDto}
				 */
		var dependencyMap = {},
				/**
				 * Module parser info
				 * @access private
				 * { filename: {__dirname: boolean, __filename: boolean, shortcut: boolean} }
				 * @type {Object}
				 */
				modulePayload = {},
				/**
				 * Value object
				 * @type {object}
				 * @default
				 * @constant
				 * @property {number} PLAINTEXT
				 * @property {number} REFERENCE
				 */
				DEPENDENCY_TYPE = {
					PLAINTEXT: 1,
					REFERENCE: 2
				};

		return {
			/**
			 *
			 * @param {string} fileName
			 * @returns {Object.<string, DependencyEntity>}
			 */
			findDependencies: function( fileName ) {
				var srcCode = cli.readJs( fileName ),
						reJs = /\.(js|json)$/ig,
						that = this,
						syntaxTree,
            dep;
				if( typeof dependencyMap[ fileName ] !== "undefined" ) {
					// skip files already in dependency dictionary
					return dependencyMap;
				} else {
					// check file for filename conflict
					for ( dep in dependencyMap ) {
						if( dependencyMap.hasOwnProperty( dep ) ) {
							if( dep.toUpperCase() === fileName.toUpperCase() ) {
								console.log( "possible fileName conflict, found: " + fileName + ", but already have: " + dep );
							}
						}
					}
				}

				// If it's not a valid JavaScript, so treat it as Plain text (can be a template)
				if ( !reJs.test( fileName	) ) {
					dependencyMap[ fileName ] = DEPENDENCY_TYPE.PLAINTEXT;
					modulePayload[ fileName ] = {};
					return dependencyMap;
				}

				try {
					syntaxTree = parser.getSyntaxTree( srcCode );
				}	catch( e ) {
					throw new ReferenceError( "`" + fileName + "` appears to be invalid JavaScript" );
				}

				modulePayload[ fileName ] = parser.getRequirements( syntaxTree );
				dependencyMap[ fileName ] = [];
				// Populate dependencyMap, where dependencyMap[filename] = depEntity
				parser.getDependecies( syntaxTree ).forEach(function( depEntity ){
					// If invalid syntax of require. E.g. require( [ "domReady" ], function ( domReady ) {..});
					if ( !depEntity.id ) {
						return;
					}
					// If require configuration provided
					if ( config && config[ depEntity.id ] ) {
						depEntity.globalProperty = config[ depEntity.id ].globalProperty || depEntity.globalProperty;
						depEntity.exports = config[ depEntity.id ].exports || depEntity.exports;
						depEntity.require = config[ depEntity.id ].require || depEntity.require;
						if ( !depEntity.globalProperty ) {
							// In the case of dependency path specified in config (it must be first resolved to the root)cd ..
							depEntity.filename = cli.resolveFilename(
								cli.resolvePath( config[ depEntity.id ].path )
							);
						}
						dependencyMap[ fileName ].push( depEntity );
						if ( depEntity.globalProperty ) {
							dependencyMap[ depEntity.filename ] = DEPENDENCY_TYPE.REFERENCE;
							modulePayload[ depEntity.filename ] = {};
						} else {
							that.findDependencies( depEntity.filename );
						}
					} else {
						depEntity.filename = cli.resolveFilename( depEntity.id, fileName );
						dependencyMap[ fileName ].push( depEntity );
						that.findDependencies( depEntity.filename );
					}

				});
				return dependencyMap;
			},
			/**
			 * Analyze dependency map for looping calls and throws exceptions when any found
			 * @param {string} srcFilename - filename of the main module
			 * @param {Object.<string, DependencyEntity>} dependencyMap
			 */
			preventAnInfiniteLoops: function( srcFilename, dependencyMap ) {
				var
						/**
						 * All the module filenames proccessed during the bypass
						 * @type {string[]}
						 */
						circuit = [],
						/**
						 *
						 * @param {string} filename
						 */
						checkDepForLoopRecursively = function( filename ) {
							// Break if the dependency requires no modules
							if ( typeof dependencyMap[ filename ] === "undefined" ||
								!Array.isArray( dependencyMap[ filename ] ) ) {
								return;
							}
							dependencyMap[ filename ].forEach(function( dep ){
								// If a module occurs twice during one deep-down bypass
								if ( circuit.indexOf( dep.filename ) !== -1 ) {
									throw new ReferenceError( "`" + dep.filename +
										"` is required recursively and creates an infinite loop" );
								}
								circuit.push( dep.filename );
								checkDepForLoopRecursively( dep.filename );
								// Remove this level adding
								circuit = circuit.filter(function( fname ){
									return fname !== dep.filename;
								});
							});
						};
				circuit = [ srcFilename ];
				checkDepForLoopRecursively( srcFilename );
				return true;
			},

			/**
			 * @private
			 * Fixes fileName and path to be compliant with JavaScript syntax
			 *
			 * @param {string} fileName
			 * @returns {string}
			 */
			getFixedFileName: function ( fileName ) {
				return fileName.replace( /\\/g, "\\\\" );

				// it may lead to errors in some browsers if we use '/' and sourcemap use '\\\\'
				//return fileName.replace(/[\\]/g, '/');
			},

			/**
			 * Get wrapper code preceding module original src
			 * @param {string} filename
			 * @returns {string}
			 */
			getModuleOpener: function( filename ) {
				return "_require.def( \"" + this.getFixedFileName( filename ) +
          "\", function( _require, exports, module, global ){\n";
			},
			/**
			 * Render variable declaration code depending on what nodejs globals required in the module
			 * @param {string} filename
			 * @param {Object} requirements
			 * @returns {string}
			 */
			renderGlobalsDelaration: function( filename, requirements ) {
				/** @type {string[]} */
				var stms = [];
				requirements.__dirname && stms.push( "__dirname = \"" + cli.getDirname( filename ) + "\"" );
				requirements.__filename && stms.push( "__filename = \"" + filename + "\"" );
        requirements.__modulename && stms.push( "__modulename = \"module:" + filename.replace( /\.js$/, "" ) + "\"" );
				return stms.length ? "	var " + stms.join( ", " ) + ";\n" : "";
			},
			/**
			 * @param {string} file
			 * @returns {object|null}
			 */
			getDepEntityByFile: function( file ) {
				var key,
						entity = null,
						filterArr = function( entity ){
							return entity.filename === file;
						};
				for( key in dependencyMap ) {
					if ( dependencyMap.hasOwnProperty( key ) && Array.isArray( dependencyMap[ key ] ) ) {
						entity = dependencyMap[ key ].filter( filterArr );
						if ( entity.length ) {
							return entity.shift();
						}
					}
				}
				return null;
			},
				/**
			 * @param {string} id
			 * @returns {object|null}
			 */
			getDepEntityById: function( id ) {
				var key,
						entity = null,
						filterArr = function( entity ){
							return entity.id === id;
						};
				for( key in dependencyMap ) {
					if ( dependencyMap.hasOwnProperty( key ) && Array.isArray( dependencyMap[ key ] ) ) {
						entity = dependencyMap[ key ].filter( filterArr );
						if ( entity.length ) {
							return entity.shift();
						}
					}
				}
				return null;
			},
			/**
			 * Render var var = require(var) for a 3rd-paty module
			 * @param {moduleDependencyEntity} entity
			 * @returns {string}
			 */
			renderRequireForExternalModule: function( entity ) {
				var that = this;
				if ( entity && entity.require.length ) {
					if ( !Array.isArray( entity.require ) ) {
						entity.require = [ entity.require ];
					}
					return "\n var " + entity.require.map(function( id ){
						var module = that.getDepEntityById( id );
						if ( !module ) {
							throw new Error( "No dependency found for id = " + id );
						}
						return "\n	/** @type {module:" + id + "} */\n" +
						"	" + id + " = _require( \"" + that.getFixedFileName(module.filename) + "\" )";
					}).join( ",\n" ) + ";\n";

				}
				return "";
			},
			/**
			 * Render exports.var for a 3rd-paty module
			 * @param {moduleDependencyEntity} entity
			 * @returns {string}
			 */
			renderExportsForExternalModule: function( entity ) {
				if ( entity && entity.exports.length ) {
					if ( Array.isArray( entity.exports ) ) {
						return "\n" + entity.exports.map(function( module ){
							return "	module.exports." + module + " = " + module + ";";
						}).join( "\n" );
					}
					return "\n	module.exports = " + entity.exports + ";";
				}
				return "";
			},

			/**
			 * Render code assigning exports back to modul.exports if the module uses the shortcut
			 * @param {Object} requirements
			 * @returns {string}
			 */
			renderExportsShortcutResolvingCode: function( requirements ) {
				return requirements.shortcut ? "\n	module.exports = exports;" : "";
			},
			/**
			 * Get wrapper code trailing module original src
			 * @returns {string}
			 */
			getModuleCloser: function() {
				return "\n	return module;\n});\n\n";
			},
			/**
			 * Get code of the require function
			 * @returns {string}
			 */
			getScriptHeader: function() {
				return cli.readJs( __dirname + "/template/require.js" );
			},
			/**
			 * Get footer code
			 * @param {string} srcFilename
			 * @returns {string}
			 */
			getScriptFooter: function( srcFilename ) {
				return "(function(){\n_require( \"" + this.getFixedFileName( srcFilename ) + "\" );\n}());\n";
			},

			/**
			 * When the dependency configured as globalProperty we simply refer to the property
			 * @param {string} globalProperty
			 * @returns {string}
			 */
			getReference: function( globalProperty ) {
				return "	module.exports = window." + globalProperty + ";\n";
			},

			/**
			 * @link https://github.com/mozilla/source-map/
			 * @param {SourceMapGenerator} srcMapGen
			 * @param {number} offset
			 * @param {number} srcLen
			 * @param {string} filename
			 */
			addMapping: function( srcMapGen, offset, srcLen, filename ) {
				var i = 1;
				filename = cli.resolveRelativeScrPath( filename );
				for( ; i <= srcLen; i++ ) {
					srcMapGen.addMapping({
						generated: {
							line: offset + i,
							column: 0
						},
						source: filename,
						original: {
							line: i,
							column: 0
						}
					});
				}
			},

			/**
			 * Compile Common modules based ona given dependencyMap
			 * @param {string} srcFilename - filename of the main module
			 * @param {Object.<string, DependencyEntity>} dependencyMap
			 * @param {function} Replacer - Replacer constructor
			 * @param {SourceMapGenerator} srcMapGen
			 * @returns {string} compiler script code
			 */
			compile: function( srcFilename, dependencyMap, Replacer, srcMapGen ) {
				var callee,
						output = this.getScriptHeader(),
						that = this,
						replacer,
						moduleBody = "",
						moduleHeader = "",
						thisDepEntity = null,
						replaceModuleIdsWithResolvedFilenames = function( dep ){
							// Replace all the module ids with fully resolved filenames
							this.replacer.replace(dep.range[0], dep.range[1], "_require( \"" + that.getFixedFileName(dep.filename) + "\" )");
						};

				// dependencyMap =>
				//	{ "main.js": [ dep1, dep2 ] }
				for( callee in dependencyMap ) {
					if ( dependencyMap.hasOwnProperty( callee ) ) {
						thisDepEntity = this.getDepEntityByFile( callee );

						replacer = new Replacer(
							dependencyMap[ callee ] === DEPENDENCY_TYPE.REFERENCE ?
								this.getReference( thisDepEntity.globalProperty ) : cli.readJs( callee ) );

						switch( dependencyMap[ callee ] ){
							case DEPENDENCY_TYPE.PLAINTEXT:
								// This is a plain text, so simply convert to a string
								replacer.toString();
								break;
							case DEPENDENCY_TYPE.REFERENCE:
								break;
							default:
								// Iterate through all the dependencies
								dependencyMap[ callee ].forEach( replaceModuleIdsWithResolvedFilenames, { replacer: replacer } );
								break;
						}

						moduleHeader = that.getModuleOpener( callee ) +
							that.renderGlobalsDelaration( callee, modulePayload[ callee ] );
						moduleBody =
							that.renderRequireForExternalModule( thisDepEntity ) +
							replacer.get() +
							that.renderExportsShortcutResolvingCode( modulePayload[ callee ] ) +
              that.renderExportsForExternalModule( thisDepEntity ) +
							that.getModuleCloser();

						that.addMapping( srcMapGen,
							output.split( "\n" ).length + ( moduleHeader.split( "\n" ).length === 3 ? 1 : 0 ),
							moduleBody.split( "\n" ).length,
							callee
						);
						output += moduleHeader + moduleBody;
					}
				}
				return output + this.getScriptFooter( srcFilename );
			}
		};
	};


