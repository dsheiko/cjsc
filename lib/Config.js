"use strict";
/*
* @author sheiko
* @license MIT
*/

var DependencyConfig = require( "./Entity/DependencyConfig" ),
    clc = require( "cli-color" );

/**
 * @constructor
 * @param {string|Object} fileName
 * @param {Object} fSys
 * @param {Object} cli
 */
module.exports = function( fileName, fSys, cli ) {
  var config = {},
      validateRequireConfig = function( cfg ) {
        var prop;
        for ( prop in cfg ) {
          if ( cfg.hasOwnProperty( prop ) ) {
            cfg[ prop ] = new DependencyConfig( cfg[ prop ] );
            cli.options.debug && console.log( clc.yellow( " Found configuration for `%s`" ), prop );
          }
        }
      };

  if ( fileName && typeof fileName === "string" ) {
    try {
      config = JSON.parse( fSys.readJs( fileName ) );
    } catch ( e ) {
      throw new SyntaxError( "`" + fileName + "` appears to be invalid JSON" );
    }
  }
  if ( fileName && typeof fileName !== "string" ) {
    config = fileName;
  }
  validateRequireConfig( config );

  return {
    setModulePayload: function( id, modulePayload ) {
      if ( config && config[ id ] ) {
        modulePayload.globalProperty = config[ id ].globalProperty || modulePayload.globalProperty;
        modulePayload.exports = config[ id ].exports || modulePayload.exports;
        modulePayload.require = config[ id ].require || modulePayload.require;
      }
    },
    exists: function( id ) {
      return config && config[ id ];
    },
    get: function( id ) {
      return config[ id ];
    }
  };
};
