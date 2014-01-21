/**
* js-import-compiler
*
* @author sheiko
* @license MIT
* jscs standard:Jquery
*/

/**
* Executing cjsc cli
* @module cjsc-module
*/

	"use strict";
		/** @type {function} nodejs File I/O api */
var fs = require( "fs" ),
		/** @type {function} nodejs api for handling and transforming file paths */
		path = require( "path" ),
		/**
		 * @type {function} Cli constructor
		 */
		Cli = require( "./lib/Cli" ),
		/*
		 * @type {function} Compiler constructor
		 */
		Compiler = require( "./lib/Compiler" ),
		/**
		 * @type {function} Parser constructor
		 */
		Parser = require( "./lib/Parser" ),
		/**
		 * @type {function}  DependencyEntity constructor
		 */
		DependencyEntity = require( "./lib/Entity/Dependency" ),
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
module.exports = function( argv ) {

	if ( argv.length < 4 ) {
		console.log( HELP_SCREEN );
		process.exit( 0 );
	}

	(function(){
		var srcPath = path.resolve( argv[ 2 ] ),
				destPath = argv[ 3 ],
				cli = new Cli( path.dirname( srcPath ), fs, path ),
				compiler = new Compiler( new Parser( DependencyEntity ), cli ),
				depMap = compiler.findDependencies( srcPath );
				console.log(depMap);
				//compiler.preventAnInfiniteLoops( depMap );
				//out = compiler.wrapSourceCode( srcPath );

		//cli.writeJs( destPath, out );
	}());
};
