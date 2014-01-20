/*
	* @package cjsc
	* @author sheiko
	* @license MIT
	* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
	* @jscs standard:Jquery
	* jshint unused:false
	* Code style: http://docs.jquery.com/JQuery_Core_Style_Guidelines
	*/

// UMD boilerplate according to https://github.com/umdjs/umd
if ( typeof module === "object" && typeof define !== "function" ) {
	var define = function ( factory ) {
	module.exports = factory( require, exports, module );
	};
}
/**
	* A module representing Cli
	* @module Cli
	*/
define(function() {
	"use strict";
	/**
		* CLI services
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
				* Resolve relative path
				* ('/foo/bar/filename.js', './baz') -> /foo/bar/baz
				* ('/foo/bar', './baz') -> /foo/bar/baz
				* ('/foo/bar', '/tmp/file/') -> /tmp/file/
				* @param {string} relPath
				* @param {string} [initPath=srcPath]
				* @return {string}
				*/
				resolveFilename: function( relPath, initPath ) {
					return pathContainer.resolve( initPath ? pathContainer.dirname( initPath ) : srcPath, relPath );
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

	return Cli;

});