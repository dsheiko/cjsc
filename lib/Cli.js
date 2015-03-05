/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/
    /** @module xtend */
var extend = require( "xtend" ),
    /** @type {module:cli-color}  */
    clc = require( "cli-color" ),
    /** @type {module:util}  */
    util = require( "util" ),
    /** @module argv */
    argv = require( "argv" ),
    /** @module fs */
    fs = require( "fs" ),
    /** @module path */
    npath = require( "path" ),
    /** @type {Object} */
    defautlOptions = {};

"use strict";

argv.info( " Usage: cjsc <src-path> <dest-path>\n\n        <src-path> - source filename (e.g. main.js)\n" );
argv.option([
  {
    name: "output",
    short: "o",
    type: "string",
    description: "destination filename for compiled code",
    example: "<dest-path>, -o=<dest-path>"
  },
  {
    name: "minify",
    short: "M",
    type: "boolean",
    description: "minify the output file"
  },

  {
    name: "config",
    short: "C",
    type: "string",
    description: "specify a configuration JSON file",
    example: "--config=<file>"
  },
  {
    name: "transform",
    short: "t",
    type: "string",
    description: "use a transform module on top-level files.",
    example: "--transform=[MODULE --opt]"
  },
  {
    name: "plugin",
    short: "p",
    type: "string",
    description: "register MODULE as a plugin",
    example: "--plugin=MODULE"
  },
  {
    name: "source-map",
    type: "string",
    description: "specify an output file where to generate source map. Use \"*\" automatic naming",
    example: "--source-map=<file/pattern>"
  },
  {
    name: "source-map-url",
    type: "string",
    description: "the path to the source map to be added in.",
    example: "--source-map-url=<url>"
  },
  {
    name: "source-map-root",
    type: "string",
    description: "the path to the original source to be included in the source map.",
    example: "--source-map-root=<path>"
  },
  {
    name: "banner",
    type: "string",
    description: "preserve copyright comments in the output."
  },
  {
    name: "debug",
    type: "boolean",
    description: "debug mode."
  },
  {
    name: "help",
    short: "h",
    type: "boolean",
    description: "displays this help screen"
  }
]);

Object.keys( argv.options ).forEach(function( key ){
  defautlOptions[ key ] = "";
});

/**
  * module Cli
  * @constructor
  * @alias module:Cli
  */
module.exports = function() {
  var startTime = process.hrtime();

  return {
    /**
    * Display header (copyright)
    */
    printHeader: function() {
      console.log( " CommonJS Compiler " + this.getProjectInfo().version + " (https://github.com/dsheiko/cjsc) ");
    },
    /**
    * Display body
    * @param {number} counter
    */
    printBody: function( counter ) {
      console.log( clc.green( " >>>" ) + " " + counter + " dependencies resolved" );
      console.log( " Compilation time: " + this.getElapsedTime() );
    },
    /**
    * Determine script execution time
    * @return {String}
    */
    getElapsedTime: function() {
        var precision = 0,
            elapsed = process.hrtime( startTime )[ 1 ] / 1000000, // divide by a million to get nano to milli
        out = process.hrtime( startTime )[ 0 ] + "s, " + elapsed.toFixed( precision ) + "ms";
        startTime = process.hrtime(); // reset the timer
        return out;
    },
    /**
      * Get object with project info
      * @access public
      * @returns {Object}
      */
    getProjectInfo: function() {
      var project, plain;
      try {
        plain = fs.readFileSync( npath.join( __dirname, "..", "package.json" ), "utf-8" );
        project = JSON.parse( plain );
      } catch ( e ) {
        throw new ReferenceError( "Cannot read package.json\n" );
      }
      return project;
    },


    plugins: [],
    /**
     * Parse from command line syntax like that
     *  cjsc src out -p plugin
     * @param {type} args
     * @returns {undefined}
     */
    parsePluginOptions: function( args ){
      var that = this,
          str = args.join( " " ),
          matches,
          re = /(-p|--plugin)[=\s]+([^-][^\s]+)/gi;

       matches = str.match( re );
       if ( matches === null ) {
        return args;
       }
       matches.forEach(function( cfgStr ){
        var re = /(-p|--plugin)[=\s]+([^-][^\s]+)/gi,
            matches = re.exec( cfgStr );

         that.plugins.push({
            plugin: matches[ 2 ],
            targets: {}
         });
        str = str.replace( matches[ 0 ], "" );
      });

      return str.split( " " );
    },
    /**
     * Parse from command line syntax like that
     *  cjsc src out -t [ plugin-name --replace '{ "from": "\\$foo", "to": 42 }' ]
     * @param {type} args
     * @returns {undefined}
     */
    parseTransformOptions: function( args ){
      var that = this,
          str = args.join( " " ),
          matches,
          parse = function( str ) {
            var targets = {},
                slices = str.split( "--" ),
                plugin = slices[ 0 ].trim();

            slices.slice( 1 ).forEach(function( pairStr ){
              var arr = pairStr.split( " " ),
                  target,
                  opts;
              try {
                target = arr[ 0 ].trim();
                opts = arr.slice( 1 ).join( " " ).trim();
                targets[ target ] = opts ? global.JSON.parse( opts ) : {};
              } catch( e ) {
                throw new Error( "Cannot convert to JSON `" + target + "`  target");
              }
            });
            that.plugins.push({
              plugin: plugin,
              targets: targets
            });
          },
          re = /(-t|--transofrm)[=\s]\[([^\]]+)\]/gi;

      matches = str.match( re );

      if ( matches === null ) {
        return args;
      }

      matches.forEach(function( cfgStr ){
        var re = /(-t|--transofrm)[=\s]\[([^\]]+)\]/gi,
            matches = re.exec( cfgStr );
        parse( matches[ 2 ] );
        str = str.replace( matches[ 0 ], "" );
      });

      return str.split( " " );
    },

    /**
      * Populate options with ones founds in args
      * @access public
      * @param {Array} rawArgs
      * @returns {Object}
      */
    parseCliOptions: function( rawArgs ) {

      var args,
          parse;

      if ( util.isArray( rawArgs ) ) {
        args = this.parsePluginOptions(
          this.parseTransformOptions( rawArgs.slice( 2 ) )
        ),
        parse = argv.run( args );
        this.targets = parse.targets;
        this.options = extend( defautlOptions, parse.options );

      } else {
        // When object
        this.targets = rawArgs.targets;
        this.options = extend( defautlOptions, rawArgs.options );
        this.plugins = rawArgs.plugins || [];
      }

      if ( this.targets.length ) {
        this.srcPath = this.targets[ 0 ];
        this.destPath = this.targets.length > 1 ? this.targets[ 1 ] : this.options.output;
      }

      if ( this.options.help || !this.srcPath || !this.destPath ) {
        argv.help();
        process.exit( 0 );
      }
    }

  };
};
