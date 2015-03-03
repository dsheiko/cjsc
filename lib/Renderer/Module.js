/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

"use strict";
var
    /** @module path */
    npath = require( "path" );

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
			 * @returns {string}
			 */
			getGlobalsDelaration: function( requirements ) {
				/** @type {string[]} */
				var stms = [];
				requirements.__dirname && stms.push( "__dirname = \"" + npath.dirname( filename ) + "\"" );
				requirements.__filename && stms.push( "__filename = \"" + filename + "\"" );
        requirements.__modulename && stms.push( "__modulename = \"module:" + filename.replace( /\.js$/, "" ) + "\"" );
				return stms.length ? "	var " + stms.join( ", " ) + ";\n" : "";
			},

      /**
			 * Render var var = require(var) for a 3rd-paty module
			 * @returns {string}
			 */
			getRequireForExternalModule: function() {
				var that = this;
				if ( payload && payload.require.length ) {
					if ( !Array.isArray( payload.require ) ) {
						payload.require = [ payload.require ];
					}
					return "\n var " + payload.require.map(function( id ){
						var module = that.getDepEntityById( id );
						if ( !module ) {
							throw new Error( "No dependency found for id = " + id );
						}
						return "\n	/** @type {module:" + id + "} */\n" +
						"	" + id + " = _require( \"" + that.getFixedFileName( module.filename ) + "\" )";
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
				return requirements.shortcut ? "\n	module.exports = exports;" : "";
			},

      /**
			 * Render exports.var for a 3rd-paty module
			 * @returns {string}
			 */
			getExportsForExternalModule: function() {
        if ( payload && payload.exports.length ) {
          if ( Array.isArray( payload.exports ) ) {
            return "\n" + payload.exports.map(function( module ){
              return "	module.exports." + module + " = " + module + ";";
            }).join( "\n" );
          }
          return "\n	module.exports = " + payload.exports + ";";
        }
        return "";
      },


			/**
			 * Get wrapper code trailing module original src
			 * @returns {string}
			 */
			getCloser: function() {
				return "\n	return module;\n});\n\n";
			}


  };
};

