/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

    /** @type {module:async} */
var async = require( "async" ),
    /** @type {module:cli-color} */
    clc = require( "cli-color" ),
    /** @type {module:xtend} */
    extend = require( "xtend" ),
    /** @type {Object} */
    payloadDefaults = {
      __dirname: false,
      __filename: false,
      __modulename: false,
      shortcut: false,
      path: null,
      globalProperty: null,
      exports: [],
      require: []
    },
    /** @type {Object} */
    moduleTransformMap = {},
    /** @type {module:lib/Replacer} */
    Replacer = require( "./Replacer" ),
    /** @type {module:lib/Renderer/Module} */
    ModuleRenderer = require( "./Renderer/Module" ),
    /** @type {module:lib/Renderer/Script} */
    ScriptRenderer = require( "./Renderer/Script" );

"use strict";

/**
 * @typedef dependencyMapDto
 * @type {object} - key-value object where value is an array of depEntity
 */

/**
  * @module Compiler
  * @constructor
  * @alias module:Compiler
  * @param {Parser} parser
  * @param {Cli} cli
  * @param {config} config
  * @param {Object} srcMapGenerator
  * @param {Object} cli
  */
module.exports = function( parser, fSys, config, srcMapGenerator, cli ) {

      /**
       * Map callee filenames to the dependency array
       * { filename: DependencyEntity[] }
       * @access private
       * @type {dependencyMapDto}
       */
  var dependencyMap = new ( require( "./DependencyMap" ) )(),
      /**
       * Value object
       * @type {object}
       * @default
       * @constant
       * @property {number} PLAINTEXT
       * @property {number} REFERENCE
       */
      DEPENDENCY_TYPE = {
        REGULAR: 0,
        PLAINTEXT: 1,
        REFERENCE: 2
      },
      /** @type {String}  */
      output = "",
      /** @type {String}  */
      startModule = null;

  return {
    /**
     * Start compiling on a source file
     *
     * @param {String} fileName
     * @param {Function} cb
     * @returns {void}
     */
    start: function( fileName, cb ) {
      var that = this;
      // run as an async task
      async.each( [ fileName ], function( fileName, done ){
        that.run( fileName, done );
      }, function( err ){
        var scriptRenderer;
        if ( err ) {
          throw new Error( err );
        }
        cli.options.debug && console.log( clc.yellow( " All async tasks resolved" ) );

        // If this this the start source and it has no dependencies
        if ( !dependencyMap[ cli.srcPath ].length ) {
          console.log( " No dependencies found. Source is copied to the destination" );
          cb( dependencyMap, output );
          return;
        }

        that.preventAnInfiniteLoops( startModule );
        scriptRenderer = new ScriptRenderer( fSys );
        output = scriptRenderer.getHeader() + output + scriptRenderer.getFooter( startModule );
        cli.options[ "source-map" ] && that.generateSourceMap();

        try {
          parser.getSyntaxTree( output );
        }	catch( e ) {
          throw new ReferenceError( "Couldn't compile into a valid JavaScript" );
        }

        cb( dependencyMap, output );
      });
    },
    /**
     * Run compiler recursevly on a given start source file
     *
     * @param {String} fileName
     * @param {Function} done
     * @returns {void}
     */
    run: function( fileName, done ) {
      var that = this,
          dep,
          reJs = /\.(js|json)$/ig;

      if( dependencyMap.hasOwnProperty( fileName ) ) {
        // skip files already in dependency dictionary
        cli.options.debug && console.log( clc.yellow( " `%s` already processed, skipping" ), fileName );
        return done();
      } else {
        // check file for filename conflict
        for ( dep in dependencyMap ) {
          if( dependencyMap.hasOwnProperty( dep ) ) {
            if( dep.toUpperCase() === fileName.toUpperCase() ) {
              console.log( "Possible fileName conflict, found: " + fileName + ", but already have: " + dep );
            }
          }
        }
      }
      // If it's not a valid JavaScript, so treat it as Plain text (can be a template)
      if ( !reJs.test( fileName	) ) {
        dependencyMap[ fileName ] = DEPENDENCY_TYPE.PLAINTEXT;
        fSys.readJs( fileName, function( code ){
          that.compileModule( fileName, code,
            extend( payloadDefaults, { type: DEPENDENCY_TYPE.PLAINTEXT } ));
          done();
        });
        return;
      }
      dependencyMap[ fileName ] = [];

      if ( startModule === null ) {
        startModule = fileName;
      }
      cli.options.debug && console.log( clc.yellow( " Reading... `%s`" ), fileName );
      fSys.readJs( fileName, function( srcCode ){
        that.analyzeModule( srcCode, fileName, done );
      });
    },

    /**
     * Analyze a given module source code
     *
     * @param {String} srcCode
     * @param {String} fileName
     * @param {Function} cb
     */
    analyzeModule: function( srcCode, fileName, cb ) {
      var that = this,
          syntaxTree,
          modulePayload,
          depList,
          ownEntity;
      try {
        syntaxTree = parser.getSyntaxTree( srcCode );
      }	catch( e ) {
        return cb( "`" + fileName + "` appears to be invalid JavaScript" );
      }

      dependencyMap[ fileName ] = [];
      // Check for __dirname, __filename, shortcut
      modulePayload = parser.getRequirements( syntaxTree );
      // Read all the dependencies from AST
      depList = parser.getDependecies( syntaxTree );
      //  Get dependency entity as it was defied by parent
      ownEntity = this.find( fileName, function( entity ){
        return entity.filename === this.key;
      });

      ownEntity && config.setModulePayload( ownEntity.id, modulePayload );

      cli.options.debug && console.log( clc.yellow( " Complete  `%s`, %d dependencies%s%s" ),
        fileName,
        depList.length,
        modulePayload.exports.length ? ", " + modulePayload.exports.length + " exports" : "",
        modulePayload.globalProperty ? ", global property" : "" );

      this.compileModule( fileName, srcCode, modulePayload, ownEntity, depList );


      // The end leaf reached
      if ( !depList.length ) {
        // If this this the start source and it has no dependencies
        if ( fileName === cli.srcPath ) {
          output = srcCode;
        }
        return cb();
      }

      // Populate dependencyMap, where dependencyMap[filename] = depEntity
      async.each( depList, function( depEntity, done ){
        that.analyzeDependency( depEntity, fileName, done );
      }, function( err ){
        if ( err ) {
          throw new Error( err );
        }
        cli.options.debug && console.log( clc.yellow( " Series [%s] resolved" ), depList.map(function( e ){
          return e.filename;
        }).join( ", " ));
        cb();
      });
    },

    /**
     * Analyze dependencies forund in a given syntax tree
     *
     * @param {module:lib/Entity/Dependency} depEntity
     * @param {String} fileName
     * @param {Function) done
     * @returns {undefined}
     */
    analyzeDependency: function( depEntity, fileName, done ){
        // If invalid syntax of require. E.g. require( [ "domReady" ], function ( domReady ) {..});
        if ( !depEntity.id ) {
          return done();
        }

        // If require configuration provided
        if ( config.exists( depEntity.id ) ) {
          if ( !config.get( depEntity.id ).globalProperty ) {
            // In the case of dependency path specified in config (it must be first resolved to the root)cd ..
            depEntity.filename = fSys.resolveFilename(
              fSys.resolvePath( config.get( depEntity.id ).path )
            );
          }
          dependencyMap[ fileName ].push( depEntity );

          if ( config.get( depEntity.id ).globalProperty ) {
            dependencyMap[ depEntity.filename ] = DEPENDENCY_TYPE.REFERENCE;
            this.compileModule( depEntity.filename, this.getReference( config.get( depEntity.id ).globalProperty ),
              extend( payloadDefaults, { type: DEPENDENCY_TYPE.REFERENCE } ));
          } else {
            return this.run( depEntity.filename, done );
          }
        } else {
          // Do process dependency if it's not found (can be
          try {
            depEntity.filename = fSys.resolveFilename( depEntity.id, fileName );
          } catch( e ) {
            console.log( clc.yellow( " `" + depEntity.id + "` module not found explicitly and ignored" ) );
            return done();
          }
          // Do process dependency if it's not found (can be
          if ( !fSys.fileExists( depEntity.filename ) ) {
            console.log( clc.yellow( " `" + depEntity.filename + "` module not found explicitly and ignored" ) );
            return done();
          }
          dependencyMap[ fileName ].push( depEntity );
          return this.run( depEntity.filename, done );
        }
        return done();
    },

    /**
    * When the dependency configured as globalProperty we simply refer to the property
    * @param {string} globalProperty
    * @returns {string}
    */
    getReference: function( globalProperty ) {
       return " module.exports = window." + globalProperty + ";\n";
    },

    /**
     * @param {string} id
     * @param {Fucntion} filterFn
     * @returns {object|null}
     */
    find: function( id, filterFn ) {
      var key,
          entity = null;
      for( key in dependencyMap ) {
        if ( dependencyMap.hasOwnProperty( key ) && Array.isArray( dependencyMap[ key ] ) ) {
          entity = dependencyMap[ key ].filter( filterFn, { key: id } );
          if ( entity.length ) {
            return entity.shift();
          }
        }
      }
      return null;
    },

    /**
     * @returns {undefined}
     */
    generateSourceMap: function() {
      var syntaxTree = parser.getSyntaxTree( output, true );
      parser.getCompiledModuleRange( syntaxTree ).forEach(function( token ){
        if ( moduleTransformMap[ token.filename ] ) {
          return srcMapGenerator.addMapping( token.range[ 0 ] +
            moduleTransformMap[ token.filename ].offset,
            moduleTransformMap[ token.filename ].lines, token.filename );
        }
        // Fallback
        srcMapGenerator.addMapping( token.range[ 0 ], token.range[ 1 ] - token.range[ 0 ], token.filename );
      });
    },
    /**
     * Change module dis with fully resolved file names
     * @returns {String}
     */
    fixModuleIds: function( srcCode, filename, depList ) {
      var replacer = new Replacer( srcCode );
       depList.forEach(function( token ){
         var fixedFileName = null,
             cfg;

         if ( config.exists( token.id ) ) {
           cfg = config.get( token.id );
           if ( cfg.globalProperty ) {
             return;
           }
           if ( cfg.path ) {
             fixedFileName = fSys.resolveFilename( fSys.resolvePath( cfg.path ) );
           }
         }
         fixedFileName = fixedFileName || fSys.resolveFilename( token.id, filename );
         replacer.replace( token.range[ 0 ], token.range[ 1 ],
           "_require( \"" + fSys.getFixedFileName( fixedFileName ) + "\" )" );
       });
       return replacer.get();
    },
    /**
     *
     * @param {String} filename
     * @param {String} srcCode
     * @param {Object} [payload]
     * @param {Object} [ownEntity]
     * @returns {undefined}
     */
    compileModule: function( filename, srcCode, payload, ownEntity, depList ){
      var replacer,
          renderer = new ModuleRenderer( filename, payload, fSys ),
          that = this,
          header = "",
          body = "";

      if ( depList  ) {
        srcCode = this.fixModuleIds( srcCode, filename, depList );
      }

      replacer = new Replacer( srcCode );

      payload = payload || {};

      if ( payload.type === DEPENDENCY_TYPE.PLAINTEXT ) {
        // This is a plain text, so simply convert to a string
        replacer.toString();
      }

      header += renderer.getOpener();
      header += renderer.getGlobalsDelaration( payload );

      moduleTransformMap[ filename ] = {
        // Offset from original start line because of added header (mapping on 1st added line)
        offset: header.split( "\n" ).length - 1,
        // Original module size in lines
        lines: srcCode.split( "\n" ).length
      };

      body += renderer.getRequireForExternalModule(function( id ){
        return that.find( id, function( entity ){
          return entity.id === this.key;
         });
      });
			body += replacer.get() + ( payload.type === DEPENDENCY_TYPE.PLAINTEXT ? ";" : "" );
			body += renderer.getExportsShortcutResolvingCode( payload );

      // Case require( "./dep", "exp1", "exp2" )
      if ( ownEntity && ownEntity.exports ) {
        body += renderer.getExportsForExternalModule( ownEntity.exports );
      }
      // exports set in config
      if ( payload && payload.exports ) {
        body += renderer.getExportsForExternalModule( payload.exports );
      }

			body += renderer.getCloser();

      output += header + body;
    },

    /**
     * Analyze dependency map for looping calls and throws exceptions when any found
     * @param {string} srcFilename - filename of the main module
     * @param {Object} [map=dependencyMap] for testing
     * @return {Boolean}
     */
    preventAnInfiniteLoops: function( srcFilename, map ) {
      var
          /**
           * All the module filenames proccessed during the bypass
           * @type {string[]}
           */
          circuit = [],
          /**
           *
           * @param {string} filename
           */
          checkDepForLoopRecursively = function( filename ) {
            // Break if the dependency requires no modules
            if ( typeof map[ filename ] === "undefined" ||
              !Array.isArray( map[ filename ] ) ) {
              return;
            }
            map[ filename ].forEach(function( dep ){
              // If a module occurs twice during one deep-down bypass
              if ( circuit.indexOf( dep.filename ) !== -1 ) {
                throw new ReferenceError( "`" + dep.filename +
                  "` is required recursively and creates an infinite loop" );
              }
              circuit.push( dep.filename );
              checkDepForLoopRecursively( dep.filename );
              // Remove this level adding
              circuit = circuit.filter(function( fname ){
                return fname !== dep.filename;
              });
            });
          };
      map = map || dependencyMap;
      circuit = [ srcFilename ];
      checkDepForLoopRecursively( srcFilename );
      return true;
    }
  };
};


