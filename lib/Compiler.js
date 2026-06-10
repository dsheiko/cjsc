"use strict";
/*
* @author sheiko
* @license MIT
*/

var async = require( "async" ),
    clc = require( "cli-color" ),
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
    moduleTransformMap = {},
    Replacer = require( "./Replacer" ),
    ModuleRenderer = require( "./Renderer/Module" ),
    ScriptRenderer = require( "./Renderer/Script" );

/**
 * @constructor
 * @param {Object} parser
 * @param {Object} fSys
 * @param {Object} config
 * @param {Object} srcMapGenerator
 * @param {Object} cli
 */
module.exports = function( parser, fSys, config, srcMapGenerator, cli ) {
  var dependencyMap = new ( require( "./DependencyMap" ) )(),
      DEPENDENCY_TYPE = {
        REGULAR: 0,
        PLAINTEXT: 1,
        REFERENCE: 2
      },
      output = "",
      startModule = null;

  return {
    /**
     * @param {string} fileName
     * @param {Function} cb
     */
    start: function( fileName, cb ) {
      var that = this;
      async.each( [ fileName ], function( fileName, done ) {
        that.run( fileName, done );
      }, function( err ) {
        var scriptRenderer;
        if ( err ) {
          throw new Error( err );
        }
        cli.options.debug && console.log( clc.yellow( " All async tasks resolved" ) );

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
        } catch ( e ) {
          throw new ReferenceError( "Couldn't compile into a valid JavaScript" );
        }

        cb( dependencyMap, output );
      });
    },

    /**
     * @param {string} fileName
     * @param {Function} done
     */
    run: function( fileName, done ) {
      var that = this,
          dep,
          reJs = /\.(js|json|es6)$/ig;

      if ( dependencyMap.hasOwnProperty( fileName ) ) {
        cli.options.debug && console.log( clc.yellow( " `%s` already processed, skipping" ), fileName );
        return done();
      } else {
        for ( dep in dependencyMap ) {
          if ( dependencyMap.hasOwnProperty( dep ) ) {
            if ( dep.toUpperCase() === fileName.toUpperCase() ) {
              console.log( "Possible fileName conflict, found: " + fileName + ", but already have: " + dep );
            }
          }
        }
      }

      if ( !reJs.test( fileName ) ) {
        dependencyMap[ fileName ] = DEPENDENCY_TYPE.PLAINTEXT;
        fSys.readJs( fileName, function( code ) {
          that.compileModule( fileName, code,
            Object.assign( {}, payloadDefaults, { type: DEPENDENCY_TYPE.PLAINTEXT } ));
          done();
        });
        return;
      }

      dependencyMap[ fileName ] = [];

      if ( startModule === null ) {
        startModule = fileName;
      }
      cli.options.debug && console.log( clc.yellow( " Reading... `%s`" ), fileName );
      fSys.readJs( fileName, function( srcCode ) {
        that.analyzeModule( srcCode, fileName, done );
      });
    },

    /**
     * @param {string} srcCode
     * @param {string} fileName
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
      } catch ( e ) {
        return cb( "`" + fileName + "` appears to be invalid JavaScript" );
      }

      dependencyMap[ fileName ] = [];
      modulePayload = parser.getRequirements( syntaxTree );
      depList = parser.getDependecies( syntaxTree );
      ownEntity = this.find( fileName, function( entity ) {
        return entity.filename === this.key;
      });

      ownEntity && config.setModulePayload( ownEntity.id, modulePayload );

      cli.options.debug && console.log( clc.yellow( " Complete `%s`, %d dependencies%s%s" ),
        fileName,
        depList.length,
        modulePayload.exports.length ? ", " + modulePayload.exports.length + " exports" : "",
        modulePayload.globalProperty ? ", global property" : "" );

      try {
        this.compileModule( fileName, srcCode, modulePayload, ownEntity, depList );
      } catch ( e ) {
        return cb( e );
      }

      if ( !depList.length ) {
        if ( fileName === cli.srcPath ) {
          output = srcCode;
        }
        return cb();
      }

      async.each( depList, function( depEntity, done ) {
        that.analyzeDependency( depEntity, fileName, done );
      }, function( err ) {
        if ( err ) {
          throw new Error( err );
        }
        cli.options.debug && console.log( clc.yellow( " Series [%s] resolved" ), depList.map( function( e ) {
          return e.filename;
        }).join( ", " ) );
        cb();
      });
    },

    /**
     * @param {Object} depEntity
     * @param {string} fileName
     * @param {Function} done
     */
    analyzeDependency: function( depEntity, fileName, done ) {
      if ( !depEntity.id ) {
        return done();
      }

      if ( config.exists( depEntity.id ) ) {
        if ( !config.get( depEntity.id ).globalProperty ) {
          depEntity.filename = fSys.resolveFilename(
            fSys.resolvePath( config.get( depEntity.id ).path )
          );
        }
        dependencyMap[ fileName ].push( depEntity );

        if ( config.get( depEntity.id ).globalProperty ) {
          dependencyMap[ depEntity.filename ] = DEPENDENCY_TYPE.REFERENCE;
          this.compileModule( depEntity.filename, this.getReference( config.get( depEntity.id ).globalProperty ),
            Object.assign( {}, payloadDefaults, { type: DEPENDENCY_TYPE.REFERENCE } ));
        } else {
          return this.run( depEntity.filename, done );
        }
      } else {
        try {
          depEntity.filename = fSys.resolveFilename( depEntity.id, fileName );
        } catch ( e ) {
          console.log( clc.yellow( " `" + depEntity.id + "` module not found explicitly and ignored" ) );
          return done();
        }
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
     * @param {string} globalProperty
     * @returns {string}
     */
    getReference: function( globalProperty ) {
      return " module.exports = global." + globalProperty + ";\n";
    },

    /**
     * @param {string} id
     * @param {Function} filterFn
     * @returns {Object|null}
     */
    find: function( id, filterFn ) {
      var key,
          entity = null;
      for ( key in dependencyMap ) {
        if ( dependencyMap.hasOwnProperty( key ) && Array.isArray( dependencyMap[ key ] ) ) {
          entity = dependencyMap[ key ].filter( filterFn, { key: id } );
          if ( entity.length ) {
            return entity.shift();
          }
        }
      }
      return null;
    },

    generateSourceMap: function() {
      var syntaxTree = parser.getSyntaxTree( output, true );
      parser.getCompiledModuleRange( syntaxTree ).forEach( function( token ) {
        if ( moduleTransformMap[ token.filename ] ) {
          return srcMapGenerator.addMapping( token.range[ 0 ] +
            moduleTransformMap[ token.filename ].offset,
            moduleTransformMap[ token.filename ].lines, token.filename );
        }
        srcMapGenerator.addMapping( token.range[ 0 ], token.range[ 1 ] - token.range[ 0 ], token.filename );
      });
    },

    /**
     * @param {string} srcCode
     * @param {string} filename
     * @param {Array} depList
     * @returns {string}
     */
    fixModuleIds: function( srcCode, filename, depList ) {
      var replacer = new Replacer( srcCode );
      depList.forEach( function( token ) {
        var fixedFileName = null,
            cfg;

        if ( config.exists( token.id ) ) {
          cfg = config.get( token.id );
          if ( !cfg.globalProperty && cfg.path ) {
            fixedFileName = fSys.resolveFilename( fSys.resolvePath( cfg.path ) );
          }
          if ( cfg.globalProperty ) {
            fixedFileName = token.filename;
          }
        }
        fixedFileName = fixedFileName || fSys.resolveFilename( token.id, filename );
        replacer.replace( token.range[ 0 ], token.range[ 1 ],
          "_require( \"" + fSys.getFixedFileName( fixedFileName ) + "\" )" );
      });
      return replacer.get();
    },

    /**
     * @param {string} filename
     * @param {string} srcCode
     * @param {Object} [payload]
     * @param {Object} [ownEntity]
     * @param {Array} [depList]
     */
    compileModule: function( filename, srcCode, payload, ownEntity, depList ) {
      var replacer,
          renderer = new ModuleRenderer( filename, payload, fSys ),
          that = this,
          header = "",
          body = "";

      if ( depList ) {
        srcCode = this.fixModuleIds( srcCode, filename, depList );
      }

      replacer = new Replacer( srcCode );
      payload = payload || {};

      if ( payload.type === 1 ) {
        replacer.toString();
      }

      header += renderer.getOpener();
      header += renderer.getGlobalsDelaration( payload, fSys.getRelPath( filename ) );

      moduleTransformMap[ filename ] = {
        offset: header.split( "\n" ).length - 1,
        lines: srcCode.split( "\n" ).length
      };

      body += renderer.getRequireForExternalModule( function( id ) {
        return that.find( id, function( entity ) {
          return entity.id === this.key;
        });
      });
      body += replacer.get() + ( payload.type === 1 ? ";" : "" );
      body += renderer.getExportsShortcutResolvingCode( payload );

      if ( ownEntity && ownEntity.exports ) {
        body += renderer.getExportsForExternalModule( ownEntity.exports );
      }
      if ( payload && payload.exports ) {
        body += renderer.getExportsForExternalModule( payload.exports );
      }

      body += renderer.getCloser();
      output += header + body;
    },

    /**
     * @param {string} srcFilename
     * @param {Object} [map]
     * @returns {boolean}
     */
    preventAnInfiniteLoops: function( srcFilename, map ) {
      var circuit = [],
          checkDepForLoopRecursively = function( filename ) {
            if ( typeof map[ filename ] === "undefined" || !Array.isArray( map[ filename ] ) ) {
              return;
            }
            map[ filename ].forEach( function( dep ) {
              if ( circuit.indexOf( dep.filename ) !== -1 ) {
                throw new ReferenceError( "`" + dep.filename +
                  "` is required recursively and creates an infinite loop" );
              }
              circuit.push( dep.filename );
              checkDepForLoopRecursively( dep.filename );
              circuit = circuit.filter( function( fname ) {
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
