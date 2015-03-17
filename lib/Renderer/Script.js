/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/
module.exports = function( fSys ) {
  "use strict";
  return {
      /**
       * Get code of the require function
       * @returns {string}
       */
      getHeader: function() {
        return "(function(){\n" + fSys.readJs( __dirname + "/template/require.js" );
      },
      /**
       * Get footer code
       * @param {string} srcFilename
       * @returns {string}
       */
      getFooter: function( srcFilename ) {
        return "(function(){\n_require( \"" + fSys.getFixedFileName( srcFilename ) + "\" );\n}());\n}());";
      }
  };
};

