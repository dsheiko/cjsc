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
      /** @type {Object}  */
      asyncCallUnresolved = {},
      /** @type {String}  */
      output = "",
      /** @type {String}  */
      startModule = null;

  return {
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
        cli.options.verbose && console.log(" `%s` already processed, skipping", fileName );
        return dependencyMap;
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
        this.compileModule( fileName, fSys.readJs( fileName ),
          extend( payloadDefaults, { type: DEPENDENCY_TYPE.PLAINTEXT } ));
        return done();
      }
      dependencyMap[ fileName ] = [];
      asyncCallUnresolved[ fileName ] = true;

      if ( startModule === null ) {
        startModule = fileName;
      }
      cli.options.verbose && console.log( " Reading...", fileName );
      fSys.readJs( fileName, function( srcCode ){
        delete asyncCallUnresolved[ fileName ];
        cli.options.verbose && console.log(" Complete", fileName );
        that.analyzeModule( srcCode, fileName, done );
      });
    },
    /**
     * Analyze a given module source code
     *
     * @param {String} srcCode
     * @param {String} fileName
     * @param {Function} done
     */
    analyzeModule: function( srcCode, fileName, done ) {
      var that = this,
          syntaxTree,
          modulePayload,
          depList,
          ownEntity;
      try {
        syntaxTree = parser.getSyntaxTree( srcCode );
      }	catch( e ) {
        throw new ReferenceError( "`" + fileName + "` appears to be invalid JavaScript" );
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

      if ( config && config[ fileName ] ) {
        modulePayload.globalProperty = config[ fileName ].globalProperty || modulePayload.globalProperty;
        modulePayload.exports = config[ fileName ].exports || modulePayload.exports;
        modulePayload.require = config[ fileName ].require || modulePayload.require;
      }
      this.compileModule( fileName, srcCode, modulePayload, ownEntity );

      // Populate dependencyMap, where dependencyMap[filename] = depEntity
      async.each( depList, function( depEntity ){
        that.analyzeDependency( depEntity, fileName, done );
        done();
      }, function( err ){
        var scriptRenderer;
        if( err ) {
          // One of the iterations produced an error.
          // All processing will now stop.
          throw new Error( "`" + fileName + "` failed to process");
        }
        if ( JSON.stringify( asyncCallUnresolved ) !== "{}" ) {
          return;
        }
        that.preventAnInfiniteLoops( startModule );
        that.fixOutputModuleIds();
        scriptRenderer = new ScriptRenderer( fSys );
        output = scriptRenderer.getHeader() + output + scriptRenderer.getFooter( startModule );

        try {
          parser.getSyntaxTree( output );
        }	catch( e ) {
          throw new ReferenceError( "Couldn't compile into a valid JavaScript" );
        }

        done( dependencyMap, output );
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
          return;
        }
        // If require configuration provided
        if ( config && config[ depEntity.id ] ) {
          if ( !depEntity.globalProperty ) {
            // In the case of dependency path specified in config (it must be first resolved to the root)cd ..
            depEntity.filename = fSys.resolveFilename(
              fSys.resolvePath( config[ depEntity.id ].path )
            );
          }
          dependencyMap[ fileName ].push( depEntity );

          if ( depEntity.globalProperty ) {
            dependencyMap[ depEntity.filename ] = DEPENDENCY_TYPE.REFERENCE;
            this.compileModule( depEntity.filename, this.getReference( depEntity.globalProperty ),
              extend( payloadDefaults, { type: DEPENDENCY_TYPE.REFERENCE } ));
          } else {
            this.run( depEntity.filename, done );
          }
        } else {
          depEntity.filename = fSys.resolveFilename( depEntity.id, fileName );
          // Do process dependency if it's not found (can be
          if ( !fSys.fileExists( depEntity.filename ) ) {
            console.log( clc.cyan( "`" + depEntity.filename + "` not found and ignored" ) );
            return;
          }
          dependencyMap[ fileName ].push( depEntity );
          this.run( depEntity.filename, done );
        }
    },

    /**
    * When the dependency configured as globalProperty we simply refer to the property
    * @param {string} globalProperty
    * @returns {string}
    */
    getReference: function( globalProperty ) {
       return "	module.exports = window." + globalProperty + ";\n";
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
     * Change module dis with fully resolved file names
     * @returns {undefined}
     */
    fixOutputModuleIds: function() {
      var that = this,
          syntaxTree = parser.getSyntaxTree( output ),
          replacer = new Replacer( output ),
          outDepEntityArr = parser.getDependecies( syntaxTree );

       outDepEntityArr.forEach(function( token ){
         var dep = that.find( token.id, function( entity ){
            return entity.id === this.key;
          });
         if ( !dep ) {
           return;
         }
         replacer.replace( token.range[ 0 ], token.range[ 1 ],
            "_require( \"" + fSys.getFixedFileName( dep.filename ) + "\" )" );
       });
       output = replacer.get();
    },
    /**
     *
     * @param {String} filename
     * @param {String} srcCode
     * @param {Object} [payload]
     * @param {Object} [ownEntity]
     * @returns {undefined}
     */
    compileModule: function( filename, srcCode, payload, ownEntity ){
      var replacer = new Replacer( srcCode ),
          renderer = new ModuleRenderer( filename, payload, fSys ),
          header = "",
          body = "";

      payload = payload || {};

      if ( payload.type === DEPENDENCY_TYPE.PLAINTEXT ) {
        // This is a plain text, so simply convert to a string
        replacer.toString();
      }

      header += renderer.getOpener();
      header += renderer.getGlobalsDelaration( payload );

      body += renderer.getRequireForExternalModule();
			body += replacer.get();
			body += renderer.getExportsShortcutResolvingCode( payload );

      // Case require( "./dep", "exp1", "exp2" )
      if ( ownEntity && ownEntity.exports ) {
        body += renderer.getExportsForExternalModule( ownEntity.exports );
      }

			body += renderer.getCloser();

      srcMapGenerator.addMapping(
        output.split( "\n" ).length + ( header.split( "\n" ).length === 3 ? 1 : 0 ),
        body.split( "\n" ).length,
        filename
      );
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


