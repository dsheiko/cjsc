"use strict";
/*
* @author sheiko
* @license MIT
*/

var srcMapNs = require( "source-map" ),
    clc = require( "cli-color" );

/**
 * @constructor
 * @param {Object} cli
 * @param {Object} fSys
 */
module.exports = function( cli, fSys ) {
  var srcMapGen = new srcMapNs.SourceMapGenerator({
    file: cli.destPath
  });

  return {
    /**
     * @param {number} offset
     * @param {number} moduleLines
     * @param {string} filename
     */
    addMapping: function( offset, moduleLines, filename ) {
      var i = 1;
      offset--;
      cli.options.debug && console.log( clc.yellow( " Adding to source map for %s, offset %d, module lines %d" ),
        filename, offset, moduleLines );

      filename = fSys.resolveRelativeScrPath( filename );
      for ( ; i <= moduleLines; i++ ) {
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
