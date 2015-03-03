/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

"use strict";
var /** @module xtend */
    extend = require("xtend"),
    /** @module module:lib/Renderer/AbstractScope */
    AbstractScope = require( "./AbstractScope" );

module.exports = function( fSys ) {
  return extend({
      /**
       * Get code of the require function
       * @returns {string}
       */
      getHeader: function() {
        return fSys.readJs( __dirname + "/template/require.js" );
      },
      /**
       * Get footer code
       * @param {string} srcFilename
       * @returns {string}
       */
      getFooter: function( srcFilename ) {
        return "(function(){\n_require( \"" + this.getFixedFileName( srcFilename ) + "\" );\n}());\n";
      }
  }, new AbstractScope());
};

