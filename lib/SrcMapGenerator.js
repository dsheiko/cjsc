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
		srcMapNs = require( "source-map" ),
    /** @type {module:cli-color}  */
    clc = require( "cli-color" );

"use strict";

module.exports = function( cli, fSys ) {
  var srcMapGen = new srcMapNs.SourceMapGenerator({
    file: cli.destPath
  });
  return {

    /**
     * @link https://github.com/mozilla/source-map/
     * @param {number} offset
     * @param {number} moduleLines
     * @param {string} filename
     */
    addMapping: function( offset, moduleLines, filename ) {
      var i = 1;
      // Because source-map numeration will plus 1 (line number cannot be 0, but 1)
      offset--;
      cli.options.debug && console.log( clc.yellow( " Adding to source map for %s, offset %d, module lines %d" ),
        filename, offset, moduleLines );

      filename = fSys.resolveRelativeScrPath( filename );
      for( ; i <= moduleLines; i++ ) {
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