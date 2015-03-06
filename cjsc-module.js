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
    /** @type {module:fs} nodejs File I/O api */
var fs = require( "fs" ),
    /** @type {module:path} nodejs api for handling and transforming file paths */
    npath = require( "path" ),
    /*
     * @type {module:lib/SrcMapGenerator}
     */
    SrcMapGenerator = require( "./lib/SrcMapGenerator" ),
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
     * @type {module:Config} Config constructor
     */
    Config = require( "./lib/Config" );

/**
 * Runner
 * @param {Array || Object} argv - CLI arguments
 * @param {requireConfig} config - Depnedency configuration
 * @param {Function} [done]
 */
module.exports = function( argv, config, done ) {
  (function(){

    var
        /** @type {Compiler} */
        compiler,
        /** @type {Parser} */
        parser,
        /** @type {module:lib/FileSystem} */
        fSys,
        /** @type {module:lLib/Cli} Cli constructor  */
        cli = new require( "./lib/Cli" )(),
        /** @type {SourceMapGenerator} */
        srcMapGen;

    cli.printHeader();
    cli.parseCliOptions( argv );
    fSys = new require( "./lib/FileSystem" )( cli );

    config = new Config( config || cli.options[ "config" ], fSys, cli );

    parser = new Parser( DependencyEntity );

    srcMapGen = new SrcMapGenerator( cli, fSys );


    compiler = new Compiler( parser, fSys, config, srcMapGen, cli );

    cli.srcPath = fSys.resolveFilename( cli.srcPath );

    if ( cli.options[ "source-map" ] ) {
      cli.options[ "source-map" ] = cli.options[ "source-map" ].replace( /\*/, npath.basename( cli.destPath ) );
      fSys.setSourceMapRoot( cli.options[ "source-map-root" ] || "", cli.options[ "source-map" ] );
    }
    compiler.start( cli.srcPath, function( map, output ){

      if ( !map ) {
        return;
      }

      if ( cli.options[ "minify" ] ) {
        output = require( "uglify-js" ).minify( output, { fromString: true }).code;
      }

      if ( cli.options[ "source-map" ] ) {
        output += "\n//# sourceMappingURL=" + ( cli.options[ "source-map-url" ] || "./" ) + npath.basename( cli.options[ "source-map" ] );
      }

      fSys.writeJs( cli.destPath, cli.options.banner + output );
      cli.options[ "source-map" ] && fSys.writeJs( cli.options[ "source-map" ], srcMapGen.get() );

      map[ cli.srcPath ].length && cli.printBody( Object.keys( map ).length );
      done && done( cli.options.banner + output );
    });

  }());
};
