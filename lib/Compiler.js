/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

"use strict";

var async = require( "async" ),
    util = require( "util" ),
    /** @type {module:lib/Replacer} */
    Replacer = require("./Replacer"),
    /** @type {module:lib/Renderer/Module} */
    ModuleRenderer = require("./Renderer/Module"),
    /** @type {module:lib/Renderer/Script} */
    ScriptRenderer = require("./Renderer/Script"),
    /** @type {module:lib/Renderer/Module} */
    scope = require("./Renderer/AbstractScope")();
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
  */
module.exports = function( parser, fSys, config, srcMapGenerator ) {

      /**
       * Map callee filenames to the dependency array
       * { filename: DependencyEntity[] }
       * @access private
       * @type {dependencyMapDto}
       */
  var dependencyMap = new require( "./DependencyMap" )(),
      /**
       * Module parser info
       * @access private
       * { filename: {__dirname: boolean, __filename: boolean, shortcut: boolean} }
       * @type {Object}
       */
      modulePayload = {},
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
        this.compileModule( fileName, fSys.readJs( fileName ), { type: DEPENDENCY_TYPE.PLAINTEXT } );
        return done();
      }
      dependencyMap[ fileName ] = [];
      asyncCallUnresolved[ fileName ] = true;

      if ( startModule === null ) {
        startModule = fileName;
      }
      fSys.readJs( fileName, function( srcCode ){
        delete asyncCallUnresolved[ fileName ];
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
          modulePayload;
      try {
        syntaxTree = parser.getSyntaxTree( srcCode );
      }	catch( e ) {
        throw new ReferenceError( "`" + fileName + "` appears to be invalid JavaScript" );
      }

      dependencyMap[ fileName ] = [];
      // Check for __dirname, __filename, shortcut
      modulePayload = parser.getRequirements( syntaxTree );

      if ( config && config[ fileName ] ) {
        modulePayload.globalProperty = config[ fileName ].globalProperty || modulePayload.globalProperty;
        modulePayload.exports = config[ fileName ].exports || modulePayload.exports;
        modulePayload.require = config[ fileName ].require || modulePayload.require;
      }
      this.compileModule( fileName, srcCode, modulePayload );

      // Populate dependencyMap, where dependencyMap[filename] = depEntity
      async.each( parser.getDependecies( syntaxTree ), function( depEntity ){
        that.analyzeDependency( depEntity, modulePayload, fileName, srcCode, done );
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
        that.preventAnInfiniteLoops( startModule  );
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
     * @param {Object} modulePayload
     * @param {String} fileName
     * @param {String} srcCode
     * @param {Function) done
     * @returns {undefined}
     */
    analyzeDependency: function( depEntity, modulePayload, fileName, srcCode, done ){
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
              { type: DEPENDENCY_TYPE.REFERENCE  });
          } else {
            this.run( depEntity.filename, done );
          }
        } else {
          depEntity.filename = fSys.resolveFilename( depEntity.id, fileName );
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
     * @returns {object|null}
     */
    getDepEntityById: function( id ) {
      var key,
          entity = null,
          filterArr = function( entity ){
            return entity.id === id;
          };
      for( key in dependencyMap ) {
        if ( dependencyMap.hasOwnProperty( key ) && Array.isArray( dependencyMap[ key ] ) ) {
          entity = dependencyMap[ key ].filter( filterArr );
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
         var dep = that.getDepEntityById( token.id );
         if ( !dep ) {
           return;
         }
         replacer.replace( token.range[ 0 ], token.range[ 1 ],
            "_require( \"" + scope.getFixedFileName( dep.filename ) + "\" )" );
       });
       output = replacer.get();
    },
    /**
     *
     * @param {String} filename
     * @param {String} srcCode
     * @param {Object} [payload]
     * @returns {undefined}
     */
    compileModule: function( filename, srcCode, payload ){
      var replacer = new Replacer( srcCode ),
          renderer = new ModuleRenderer( filename, payload ),
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
      body += renderer.getExportsForExternalModule();
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
     * @return {Boolean}
     */
    preventAnInfiniteLoops: function( srcFilename ) {
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
            if ( typeof dependencyMap[ filename ] === "undefined" ||
              !Array.isArray( dependencyMap[ filename ] ) ) {
              return;
            }
            dependencyMap[ filename ].forEach(function( dep ){
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
      circuit = [ srcFilename ];
      checkDepForLoopRecursively( srcFilename );
      return true;
    }
  };
};


