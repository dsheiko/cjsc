/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/
var
    /** @module path */
    npath = require( "path" );

"use strict";

module.exports = function( filename, payload, fSys ) {
  return {
        /**
       * Get wrapper code preceding module original src
       * @returns {string}
       */
      getOpener: function() {
        return "_require.def( \"" + fSys.getFixedFileName( filename ) +
          "\", function( _require, exports, module, global ){\n";
      },
      /**
       * Render variable declaration code depending on what nodejs globals required in the module
       * @param {Object} requirements
       * @param {String} relpath
       * @returns {string}
       */
      getGlobalsDelaration: function( requirements, relpath ) {
        /** @type {string[]} */
        var stms = [];
        requirements.__dirname && stms.push( "__dirname = \"" + npath.dirname( filename ) + "\"" );
        requirements.__filename && stms.push( "__filename = \"" + filename + "\"" );
        requirements.__modulename && stms.push( "__modulename = \"module:" + relpath.replace( /\.js$/, "" ) + "\"" );
        return stms.length ? "  var " + stms.join( ", " ) + ";\n" : "";
      },

      /**
       * Render  var = require(var) for a 3rd-paty module
       * Looks up config for demanded requires
       * @param {Function} getModuleCb
       * @returns {string}
       */
      getRequireForExternalModule: function( getModuleCb ) {
        if ( payload && payload.require.length ) {
          if ( !Array.isArray( payload.require ) ) {
            payload.require = [ payload.require ];
          }
          return "\n var " + payload.require.map(function( id ){
            var module = getModuleCb( id );
            if ( !module ) {
              throw new Error( "No dependency found for id = " + id );
            }
            return "\n  /** @type {module:" + id + "} */\n" +
            "  " + id + " = _require( \"" + fSys.getFixedFileName( module.filename ) + "\" )";
          }).join( ",\n" ) + ";\n";
        }
        return "";
      },

      /**
       * Render code assigning exports back to modul.exports if the module uses the shortcut
       * @param {Object} requirements
       * @returns {string}
       */
      getExportsShortcutResolvingCode: function( requirements ) {
        return requirements.shortcut ? "\n  module.exports = exports;" : "";
      },

      /**
       * Render exports.var for a 3rd-paty module
       * Looks up config for demanded exports or in secondary params of require(..)
       * @param {Array} exported
       * @return {String}
       */
      getExportsForExternalModule: function( exported ) {
        if ( exported ) {
          if ( Array.isArray( exported ) ) {
            return "\n" + exported.map(function( module ){
              return "  module.exports." + module + " = " + module + ";";
            }).join( "\n" );
          }
          return "\n  module.exports = " + exported + ";";
        }
        return "";
      },

      /**
       * Get wrapper code trailing module original src
       * @returns {string}
       */
      getCloser: function() {
        return "\n  return module;\n});\n\n";
      }


  };
};

