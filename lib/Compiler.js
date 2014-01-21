/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

	"use strict";
	/**
		* @module Compiler
		* @constructor
		* @alias module:Compiler
		* @param {Parser} parser
		* @param {Cli} cli
		*/
	var Compiler = function( parser, cli ) {
		var dependencyMap = {};

		return {
			/**
			 *
			 * @param {string} id
			 * @returns {dependencyMapEntiry[]}
			 */
			findDependencies: function( id ) {
				var fileName = cli.resolveFilename( id ),
						srcCode = cli.readJs( fileName ),
						that = this,
						syntaxTree;

				try {
					syntaxTree = parser.getSyntaxTree( srcCode );
				}	catch( e ) {
					throw new ReferenceError( "`" + id + "` appears to be invalid JavaScript" );
				}
				parser.getDependecies( syntaxTree ).forEach(function( depEntity ){
					dependencyMap[ fileName ] = dependencyMap[ fileName ] || [];
					depEntity.resolve( cli.resolveFilename, cli, fileName );
					dependencyMap[ fileName ].push( depEntity );
					that.findDependencies( depEntity.id );
				});
				return dependencyMap;
			},
			/**
			 * Analyze dependency map for looping calls and throws exceptions when any found
			 * @param {string} srcFilename - filename of the main module
			 * @param {DependencyEntity} dependencyMap
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
							if ( typeof dependencyMap[ filename ] === "undefined" ) {
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
			wrapSourceCode: function( dependencyMap ) {

			}
		};
	};

module.exports = Compiler;

