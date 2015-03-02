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

/**
* @typedef requireConfig
* @type {Object}
* @property {module:DependencyConfig} depId
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
		 * @type {module:Cli} Cli constructor
		 */
		Cli = require( "./lib/Cli" ),
		/*
		 * @type {module:Compiler} Compiler constructor
		 */
		Compiler = require( "./lib/Compiler" ),
		/**
		 * @type {module:Parser} Parser constructor
		 */
		Parser = require( "./lib/Parser" ),
		/**
		 * @type {module:Replacer} Replacer constructor
		 */
		Replacer = require( "./lib/Replacer" ),
		/**
		 * @type {module:DependencyEntity}  DependencyEntity constructor
		 */
		DependencyEntity = require( "./lib/Entity/Dependency" ),
		/**
		 * @type {module:DependencyConfig} DependencyConfig constructor
		 */
		DependencyConfig = require( "./lib/Entity/DependencyConfig" ),

		/**
		 * @constant
		 * @type {string}
		 * @default
		 */
		HELP_SCREEN = " Usage: cjsc <src-path> <dest-path>\n" +
					" <src-path> - source filename (e.g. main.js)\n" +
					" <dest-path>, -o=<dest-path> - destination filename for compiled code\n" +
					" -M, --minify - minify the output file\n" +
					" --config=<file> - specify a configuration JSON file\n" +
					" --source-map=<file/pattern> - specify an output file where to generate source map. Use \"*\" automatic naming\n" +
					" --source-map-url=<url> - the path to the source map to be added in.\n" +
				  " --source-map-root=<path> - the path to the original source to be included in the source map.\n" +
          " -t, --transform=[plugin --opt]";
/**
 * Runner
 * @param {*[]} argv - CLI arguments
 * @param {requireConfig} config - Depnedency configuration
 */
module.exports = function( argv, config ) {

	(function(){
				/** @type {string} */
		var srcPath = null,
				/** @type {string} */
				destPath = null,
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
         *
         * @type {Object}
         */
        plugins = {},
				/**
				 * @param {Object} config
				 */
				validateRequireConfig = function( config ) {
					var prop;
					for ( prop in config ) {
						if ( config.hasOwnProperty( prop ) ) {
							config[ prop ] = new DependencyConfig( config[ prop ] );
						}
					}
				};


    cli.parseCliOptions( argv );
		cli.printHeader();

    if ( cli.targets.length ) {
      srcPath = cli.targets[ 0 ];
      destPath = cli.targets.length > 1 ? cli.targets[ 1 ] : cli.options[ "ouput" ];
    }

		if ( cli.options[ "help" ] || !srcPath || !destPath ) {
			console.log( HELP_SCREEN );
			process.exit( 0 );
		}



		config = config || {};
		if ( cli.options[ "config" ] ) {
			try {
				config = JSON.parse( cli.readJs( cli.options[ "config" ] ) );
			} catch( e ) {
				throw new SyntaxError( "`" + cli.options[ "config" ] + "` appears to be invalid JSON" );
			}
			// Validate the contract
			validateRequireConfig( config );
		}

		parser = new Parser( DependencyEntity );

		compiler = new Compiler( parser, cli, config );
		srcResolvedFile = cli.resolveFilename( srcPath );

		srcMapGen = new srcMapNs.SourceMapGenerator({
			file: destPath
		});

		if ( cli.options[ "source-map" ] ) {
			cli.options[ "source-map" ] = cli.options[ "source-map" ].replace( /\*/, path.basename( destPath ) );
			cli.setSourceMapRoot( cli.options[ "source-map-root" ] || "", cli.options[ "source-map" ] );
		}

    plugins = cli.resolvePlugins();

		map = compiler.findDependencies( srcResolvedFile, plugins.hookSource );

		if ( map[ srcResolvedFile ].length ) {
			compiler.preventAnInfiniteLoops( srcResolvedFile, map );
			out = compiler.compile( srcResolvedFile, map, Replacer, srcMapGen, plugins.hookModule );

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

		if ( cli.options[ "source-map" ] ) {
			out += "\n//# sourceMappingURL=" + ( cli.options[ "source-map-url" ] || "./" ) + path.basename( cli.options[ "source-map" ] );
		}



/*
var all= [], plugin = require("./plugin");
require( "fs" )
  .createReadStream( "./README.md" )
  .pipe(plugin("..", {replace: [
    { from: /Alternatives/, to: "######YOOOO" }
  ]}))
  .on('data', function (data) {
    all.push(data);
  })
  .on('end', function () {
    var txt = all.toString();
    console.log(txt);
    //require( "fs" ).createWriteStream('out.txt', all);
  });
*/


		cli.writeJs( destPath, cli.options.banner + out );
		cli.options[ "source-map" ] && cli.writeJs( cli.options[ "source-map" ], srcMapGen.toString() );
		map[ srcResolvedFile ].length && cli.printBody( Object.keys( map ).length );
	}());
};
