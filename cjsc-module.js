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
		 * @link https://github.com/mozilla/source-map/
		 * @type {object}
		 */
		srcMapNs = require( "source-map" ),
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
					" -M, --minify - minify the output file\n" +
					" --source-map - specify an output file where to generate source map. Use \"*\" automatic naming\n" +
					" --source-map-url - specify an output file where to generate source map.\n";
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
				cli = new Cli( path.dirname( srcPath ), process.cwd(), fs, path ),
				/** @type {SourceMapGenerator} */
				srcMapGen,
				/**
				 * @type {Object}
				 */
				options = cli.parseCliOptions( argv );

		cli.printHeader();

		if ( argv.length < 4 ) {
			console.log( HELP_SCREEN );
			process.exit( 0 );
		}
		parser = new Parser( DependencyEntity );
		compiler = new Compiler( parser, cli );
		srcResolvedFile = cli.resolveFilename( srcPath );

		srcMapGen = new srcMapNs.SourceMapGenerator({
			file: destPath
		});

		map = compiler.findDependencies( srcResolvedFile );

		if ( map[ srcResolvedFile ].length ) {
			compiler.preventAnInfiniteLoops( srcResolvedFile, map );
			out = compiler.compile( srcResolvedFile, map, Replacer, srcMapGen );

			try {
				parser.getSyntaxTree( out );
			}	catch( e ) {
				throw new ReferenceError( "Couldn't compile into a valid JavaScript" );
			}
		} else {
			out = cli.readJs( srcResolvedFile );
			console.log( " No dependencies found. Source is copied to the destination" );
		}
		if ( argv.indexOf( "-M" ) !== -1 || argv.indexOf( "--minify" ) !== -1 ) {
			out = require( "uglify-js" ).minify( out, { fromString: true }).code;
		}

		if ( options[ "source-map" ] ) {
			options[ "source-map" ] = options[ "source-map" ].replace( /\*/, path.basename( destPath ) );
			out += "\n//# sourceMappingURL=" + options[ "source-map-url" ] + path.basename( options[ "source-map" ] );
		}

		cli.writeJs( destPath, options.banner + out );
		options[ "source-map" ] && cli.writeJs( options[ "source-map" ], srcMapGen.toString() );
		map[ srcResolvedFile ].length && cli.printBody( Object.keys( map ).length );
	}());
};
