/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/
var
    /**
		 * @link https://github.com/mozilla/source-map/
		 * @type {object}
		 */
		srcMapNs = require( "source-map" );

"use strict";

module.exports = function( destPath, fSys ) {
  var srcMapGen = new srcMapNs.SourceMapGenerator({
    file: destPath
  });
  return {
    /**
     * @link https://github.com/mozilla/source-map/
     * @param {number} offset
     * @param {number} srcLen
     * @param {string} filename
     */
    addMapping: function( offset, srcLen, filename ) {
      var i = 1;
      filename = fSys.resolveRelativeScrPath( filename );
      for( ; i <= srcLen; i++ ) {
        srcMapGen.addMapping({
          generated: {
            line: offset + i,
            column: 0
          },
          source: filename,
          original: {
            line: i,
            column: 0
          }
        });
      }
    },
    get: function() {
      return srcMapGen.toString();
    }
  };
};