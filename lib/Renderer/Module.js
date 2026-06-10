"use strict";
/*
* @author sheiko
* @license MIT
*/

var npath = require( "path" );

/**
 * @constructor
 * @param {string} filename
 * @param {Object} payload
 * @param {Object} fSys
 */
module.exports = function( filename, payload, fSys ) {
  return {
    /**
     * @returns {string}
     */
    getOpener: function() {
      return "_require.def( \"" + fSys.getFixedFileName( filename ) +
        "\", function( _require, exports, module, global ){\n";
    },

    /**
     * @param {Object} requirements
     * @param {string} relpath
     * @returns {string}
     */
    getGlobalsDelaration: function( requirements, relpath ) {
      var stms = [];
      requirements.__dirname && stms.push( "__dirname = \"" + npath.dirname( filename ) + "\"" );
      requirements.__filename && stms.push( "__filename = \"" + filename + "\"" );
      requirements.__modulename && stms.push( "__modulename = \"module:" + relpath.replace( /\.js$/, "" ) + "\"" );
      return stms.length ? "  var " + stms.join( ", " ) + ";\n" : "";
    },

    /**
     * @param {Function} getModuleCb
     * @returns {string}
     */
    getRequireForExternalModule: function( getModuleCb ) {
      if ( payload && payload.require.length ) {
        if ( !Array.isArray( payload.require ) ) {
          payload.require = [ payload.require ];
        }
        return "\n var " + payload.require.map( function( id ) {
          var mod = getModuleCb( id );
          if ( !mod ) {
            throw new Error( "No dependency found for id = " + id );
          }
          return "\n  /** @type {module:" + id + "} */\n" +
            "  " + id + " = _require( \"" + fSys.getFixedFileName( mod.filename ) + "\" )";
        }).join( ",\n" ) + ";\n";
      }
      return "";
    },

    /**
     * @param {Object} requirements
     * @returns {string}
     */
    getExportsShortcutResolvingCode: function( requirements ) {
      return requirements.shortcut ? "\n  module.exports = exports;" : "";
    },

    /**
     * @param {Array|string} exported
     * @returns {string}
     */
    getExportsForExternalModule: function( exported ) {
      if ( !exported || ( Array.isArray( exported ) && !exported.length ) ) {
        return "";
      }
      if ( Array.isArray( exported ) ) {
        return "\n" + exported.map( function( mod ) {
          return "  module.exports." + mod + " = " + mod + ";";
        }).join( "\n" );
      }
      return "\n  module.exports = " + exported + ";";
    },

    /**
     * @returns {string}
     */
    getCloser: function() {
      return "\n  return module;\n});\n\n";
    }
  };
};
