"use strict";
/*
* @author sheiko
* @license MIT
*/

var fs = require( "fs" ),
    npath = require( "path" ),
    SrcMapGenerator = require( "./lib/SrcMapGenerator" ),
    Compiler = require( "./lib/Compiler" ),
    Parser = require( "./lib/Parser" ),
    Replacer = require( "./lib/Replacer" ),
    DependencyEntity = require( "./lib/Entity/Dependency" ),
    Config = require( "./lib/Config" );

/**
 * @param {Array|Object} rawArgv - CLI arguments or { targets, options } object
 * @param {Object} config - dependency configuration
 * @param {Function} [done]
 */
module.exports = function( rawArgv, config, done ) {
  (function() {
    var compiler, parser, fSys, srcMapGen,
        cli = new ( require( "./lib/Cli" ) )();

    cli.printHeader();
    cli.run( rawArgv );

    fSys = new ( require( "./lib/FileSystem" ) )( cli );
    config = new Config( config || cli.options[ "config" ], fSys, cli );
    parser = new Parser( DependencyEntity );
    srcMapGen = new SrcMapGenerator( cli, fSys );
    compiler = new Compiler( parser, fSys, config, srcMapGen, cli );

    cli.srcPath = fSys.resolveFilename( cli.srcPath );

    if ( cli.options[ "source-map" ] ) {
      cli.options[ "source-map" ] = cli.options[ "source-map" ].replace( /\*/, npath.basename( cli.destPath ) );
      fSys.setSourceMapRoot( cli.options[ "source-map-root" ] || "", cli.options[ "source-map" ] );
    }

    compiler.start( cli.srcPath, function( map, output ) {
      var minifyResult;

      if ( !map ) {
        return;
      }

      if ( cli.options[ "minify" ] ) {
        minifyResult = require( "uglify-js" ).minify( output );
        if ( minifyResult.error ) {
          throw minifyResult.error;
        }
        output = minifyResult.code;
      }

      if ( cli.options[ "source-map" ] ) {
        output += "\n//# sourceMappingURL=" + ( cli.options[ "source-map-url" ] || "./" ) +
          npath.basename( cli.options[ "source-map" ] );
      }

      fSys.writeJs( cli.destPath, cli.options.banner + output );
      cli.options[ "source-map" ] && fSys.writeJs( cli.options[ "source-map" ], srcMapGen.get() );

      map[ cli.srcPath ].length && cli.printBody( Object.keys( map ).length );
      done && done( cli.options.banner + output );
    });
  }());
};
