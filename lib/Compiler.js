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
			 */
			preventAnInfiniteLoops: function( dependencyMap ) {
						/** @type {string} */
				var topLevelFilename,
						/**
						 * All the module filenames proccessed during the bypass
						 * @type {string[]}
						 */
						inBranch = [],
						/**
						 *
						 * @param {string} filename
						 */
						checkDepforLoopRecursively = function( filename ) {
							var loopingDeps;
							if ( typeof dependencyMap[ filename ] === "undefined" ) {
								return;
							}
							if ( inBranch.indexOf( filename ) !== -1 ) {
								throw new ReferenceError( "`" + filename + "` is required recursively what creates an infinite loop" );
							}
							inBranch.push( filename );

							loopingDeps = dependencyMap[ filename ].filter(function( dep ){
								checkDepforLoopRecursively( dep.filename );
								return dep.filename === topLevelFilename;
							});

							if ( loopingDeps.length ) {
								throw new ReferenceError( "`" + topLevelFilename + "` required back in a dependent module `" +
									loopingDeps[ 0 ].filename + "` what creates an infinite loop" );
							}
						};
				for( topLevelFilename in dependencyMap ) {
					if ( dependencyMap.hasOwnProperty( topLevelFilename ) ) {
						inBranch = [];
						checkDepforLoopRecursively( topLevelFilename );
					}
				}
			},
			wrapSourceCode: function( dependencyMap ) {

			}
		};
	};

module.exports = Compiler;

