"use strict";
/*
* @author sheiko
* @license MIT
*/

/**
 * @constructor
 * @param {Object} fSys
 */
module.exports = function( fSys ) {
  return {
    /**
     * @returns {string}
     */
    getHeader: function() {
      return "(function(){\n" + fSys.readJs( __dirname + "/template/require.js" );
    },

    /**
     * @param {string} srcFilename
     * @returns {string}
     */
    getFooter: function( srcFilename ) {
      return "(function(){\n_require( \"" + fSys.getFixedFileName( srcFilename ) + "\" );\n}());\n}());";
    }
  };
};
