/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

var /** @type {module:cli-color}  */
    clc = require( "cli-color" ),
    /** @type {module:util}  */
    util = require( "util" ),
    /** @type {module:subarg} */
    subarg = require( "subarg" ),
    /** @type {Array} */

    config = [
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
      type: "object",
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
  ];

"use strict";

/**
  * module Cli
  * @constructor
  * @alias module:Cli
  */
module.exports = function() {
  var startTime = process.hrtime();

  return {
    /**
      * Get object with project info
      * @access public
      * @returns {Object}
      */
    getProjectInfo: function() {
      var project,
          plain,
           /** @type {module:fs} */
          fs = require( "fs" ),
          /** @type {module:path} */
          npath = require( "path" );

      try {
        plain = fs.readFileSync( npath.join( __dirname, "..", "package.json" ), "utf-8" );
        project = JSON.parse( plain );
      } catch ( e ) {
        throw new ReferenceError( "Cannot read package.json\n" );
      }
      return project;
    },
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


    /** @type {Object} */
    options: {},
    /** @type {String} */
    srcPath: null,
    /** @type {String} */
    destPath: null,
    /**
     * Render help screen
     * @return {void}
     */
    help: function() {
      var margin = "    ";
      console.log( "\n Usage: cjsc <src-path> <dest-path>\n" );
      console.log( margin + "<src-path> - source filename (e.g. main.js)\n");
      config.forEach(function( opt ){
        console.log( margin +
          "--" + opt.name +
          ( opt.short ? ", -" + opt.short : "" )
        );
        if ( opt.description ) {
          console.log( margin + margin + opt.description );
        }
        if ( opt.example ) {
          console.log( margin + margin + "example: " + opt.example );
        }
        console.log( " " );
      });
    },
    /**
     * Find match in config for short/option given
     * @param {String} key
     * @return {void}
     */
    findOpt: function( key ) {
      var res = config.filter(function( opt ){
        return ( opt.name === key || ( opt.short && opt.short === key ) );
      });
      return ( res && res.length ) ? res[ 0 ].name : false;
    },

    /**
     * Populate this.options.transform
     * this.options.transform[ plguin ] = { opt1: 'value' }
     * this.options.transform[ plguin ] = { opt1: ['foo', 'bar'] }
     *
     * @param {Object} args - minimalist output
     * @return {Array} CLI plugins
     */
    getSubargs: function( args ) {
      var target,
          options = {};
      if ( !args._ || !args._[ 0 ] ) {
        throw new TypeError( "Could not find node-package name `-t [ name --param ]`" );
      }
      target = args._[ 0 ];
      Object.keys( args ).forEach(function( key ){
        if ( key !== "_" ) {
          options[ key ] = args[ key ];
        }
      });

      this.options.transform = this.options.transform || [];
      this.options.transform.push({
        target: target,
        options: options
      });

      return this.options.transform;
    },
    /**
     *
     * @return {void}
     */
    populateDefaults: function(){
      var that = this;
      config.forEach(function( entry ){
        that.options[ entry.name ] = "";
      });
    },
    /**
     * Convert minimalist output to ARGV-like object
     * @param {Object} mArgs - minimalist args
     * @return {void}
     */
    minimalistToArgv: function( mArgs ){
      var that = this;
      this.targets = mArgs._;
      Object.keys( mArgs ).forEach(function( key ){
        var opt;
        if ( key === "_" ) {
          return;
        }
        opt = that.findOpt( key );
        if ( !opt ) {
          throw new TypeError( "`" + key + "` key not found" );
        }
        if ( opt === "transform" || opt === "plugin" && typeof mArgs[ key ] === "object" ) {
          that.options[ opt ] = that.getSubargs( mArgs[ key ]  );
          return;
        }
        that.options[ opt ] = mArgs[ key ];
      });
    },

    /**
     * Convert injected object to ARGV-like object
     * @param {Object} mArgs
     * @return {void}
     */
    objectToArgv: function( mArgs ){
      var that = this;
      Object.keys( mArgs ).forEach(function( key ){
        var opt = that.findOpt( key );
        if ( !opt ) {
          throw new TypeError( "`" + key + "` key not found" );
        }
        that.options[ opt ] = mArgs[ key ];
      });
    },

    /**
     * Parse cli arguments including subargs
     * @param {Array} rawArgs
     * @return {void}
     */
    run: function( rawArgs ) {
      var mArg;
      this.populateDefaults();
      try {
        if ( util.isArray( rawArgs ) ) {
          mArg = subarg( rawArgs.slice( 2 ) );
          this.minimalistToArgv( mArg );
        } else {
          // Object injected
          this.targets = rawArgs.targets;
          this.objectToArgv( rawArgs.options );
        }

      } catch( err ) {
        this.help();
        console.log( "\n " + clc.red( err ) );
        process.exit( 0 );
      }


      if ( this.targets.length ) {
        this.srcPath = this.targets[ 0 ];
        this.destPath = this.targets.length > 1 ? this.targets[ 1 ] : this.options.output;
      }

      if ( this.options.help || !this.srcPath || !this.destPath ) {
        this.help();
        process.exit( 0 );
      }

      if ( this.options.debug && this.options.transform ) {
        Object.keys( this.options.transform ).forEach(function( k ){
          console.log( clc.yellow( " Register plugin `%s`" ), k );
        });
      }
    }

  };
};
