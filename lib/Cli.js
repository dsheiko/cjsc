/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

	"use strict";
	/**
		* module Cli
		* @constructor
		* @alias module:Cli
		* @param {string} srcPath
		* @param {function} fsContainer
		* @param {function} pathContainer
		*/
	var Cli = function( srcPath, fsContainer, pathContainer ) {
			// Dependency injection
			fsContainer = fsContainer || {};
			pathContainer = pathContainer || {};
			return {
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

					if ( !fsContainer.existsSync( pathArg ) ) {
						pathArg = pathArg + ".js";
						if ( !fsContainer.existsSync( pathArg ) ) {
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
					return pathContainer.resolve( calleeFilename ? pathContainer.dirname( calleeFilename ) : srcPath, relPath );
				},
				/**
				* Test if a given path exists
				* @param {string} pathArg
				*/
				exists: function( pathArg ){
					if ( !fsContainer.existsSync( pathArg ) ) {
						pathArg = pathArg + ".js";
						return fsContainer.existsSync( pathArg );
					}
					return true;
				}
			};
		};

module.exports = Cli;