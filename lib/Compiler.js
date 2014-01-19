/*
	* @package jscodesniffer
	* @author sheiko
	* @license MIT
	* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
	* jscs standard:Jquery
	* jshint unused:false
	* Code style: http://docs.jquery.com/JQuery_Core_Style_Guidelines
	*/

// UMD boilerplate according to https://github.com/umdjs/umd
if ( typeof module === "object" && typeof define !== "function" ) {
	/**
	* Override AMD `define` function for RequireJS
	* @param {function( function, Object, Object )} factory
	*/
	var define = function ( factory ) {
		module.exports = factory( require, exports, module );
	};
}
/**
	* A module representing Compiler
	* @module Compiler
	*/
define(function() {
	"use strict";
	/**
		* Compiler
		* @constructor
		* @alias module:Compiler
		* @param {Parser} parser
		* @param {Cli} cli
		*/
	var Compiler = function( parser, cli ) {
		var dependencies = [],
				callMap = {};

		return {
			findDependencies: function( id ) {
				var fileName = cli.resolveFilename( id ),
						srcCode = cli.readJs( fileName ),
						that = this;
				if ( parser.isValidJs()	) {
					console.error( fileName + " appears to be invalid JavaScript" );
				}
				dependencies.push( fileName );
				parser.getDependecyIds( srcCode ).forEach(function( id ){
					callMap[ fileName ] = callMap[ fileName ] || [];
					callMap[ fileName ].push( cli.resolveFilename( id ) );
					that.findDependencies( id );
				});

			},
			resolveFilename: function( id ) {
				return filename;
			},
			wrapSourceCode: function( id ) {
				
			}
		};
	};

	return Compiler;

});