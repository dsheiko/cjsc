/**
	* js-import-compiler
	*
	* Look for dependencies recursively in source file and
	* resolve them in compiled destination file
	*
	* Dependency annotation:
	* var ValidationLogger = $import("./Form/ValidationLogger"),..
	*
	* @package jscs
	* @author sheiko
	* @license MIT
	* @jscs standard:Jquery
	* Code style: http://docs.jquery.com/JQuery_Core_Style_Guidelines
	*/

// UMD boilerplate according to https://github.com/umdjs/umd
if ( typeof module === "object" && typeof define !== "function" ) {
	var define = function ( factory ) {
		module.exports = factory( require, exports, module );
	};
}
/**
	* Executing jscs cli
	* @module jscodesniffer
	*/
define(function( require ) {
	"use strict";
var fs = require( "fs" ),
		path = require( "path" ),
		/**
		 * Command line interface
		 * @type {Cli}
		 */
		Cli = require( "./lib/Cli" ),
		/*
		 * @type {Compiler}
		 */
		Compiler = require( "./lib/Compiler" ),
		/**
		 *
		 * @type {Parser}
		 */
		Parser = require( "./lib/Parser" ),
		/**
		 *
		 * @type {Dependency}
		 */
		Dependency = require( "./lib/Dependency" ),
		/**
		 * @constant
		 * @type {string}
		 * @default
		 */
		HELP_SCREEN = "Usage: cjsc <src-path> <dest-path>\n" +
					"<src-path> - filename\n" +
					"<dest-path> - filename\n";
    /**
		 * Runner
		 */
		return function( argv ) {

			if ( argv.length < 4 ) {
				console.log( HELP_SCREEN );
				process.exit( 0 );
			}

			(function(){
				var srcPath = path.resolve( argv[ 2 ] ),
						destPath = argv[ 3 ],
						cli = new Cli( path.dirname( srcPath ), fs, path ),
						compiler = new Compiler( new Parser(), cli );
						compiler.findDependencies( srcPath );
						out = compiler.wrapSourceCode( srcPath );

				cli.writeJs( destPath, out );
			}());
		};
});