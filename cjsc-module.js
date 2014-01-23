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
		 * @type {function} Replacer constructor
		 */
		Replacer = require( "./lib/Replacer" ),
		/**
		 * @type {function}  DependencyEntity constructor
		 */
		DependencyEntity = require( "./lib/Entity/Dependency" ),
		/**
		 * @constant
		 * @type {string}
		 * @default
		 */
		HELP_SCREEN = " Usage: cjsc <src-path> <dest-path>\n" +
					" <src-path> - source filename (e.g. main.js)\n" +
					" <dest-path> - destination filename for compiled code\n" +
					" -M, --minify - minify the destination filename\n";
/**
 * Runner
 */
module.exports = function( argv ) {

	(function(){
				/** @type {string} */
		var srcPath = path.resolve( argv[ 2 ] ),
				/** @type {string} */
				destPath = argv[ 3 ],
				/** @type {string} */
				out,
				/** @type {Compiler} */
				compiler,
				/** @type {Parser} */
				parser,
				/** @type {string} srcResolvedFile - fully resolved main module (source) filename */
				srcResolvedFile,
				/** @type {Object} */
				map,
				/** @type {Cli} */
				cli = new Cli( path.dirname( srcPath ), fs, path );

		cli.printHeader();

		if ( argv.length < 4 ) {
			console.log( HELP_SCREEN );
			process.exit( 0 );
		}
		parser = new Parser( DependencyEntity );
		compiler = new Compiler( parser, cli );
		srcResolvedFile = cli.resolveFilename( srcPath );
		map = compiler.findDependencies( srcResolvedFile );
		compiler.preventAnInfiniteLoops( srcResolvedFile, map );
		out = compiler.compile( srcResolvedFile, map, Replacer );
		try {
			parser.getSyntaxTree( out );
		}	catch( e ) {
			throw new ReferenceError( "Couldn't compile into a valid JavaScript" );
		}
		if ( argv.indexOf( "-M" ) !== -1 || argv.indexOf( "--minify" ) !== -1 ) {
			out = require( "uglify-js" ).minify( out, { fromString: true }).code;
		}
		cli.writeJs( destPath, out );
		cli.printBody( Object.keys( map ).length );
	}());
};
