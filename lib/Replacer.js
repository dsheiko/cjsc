"use strict";
/*
* @author sheiko
* @license MIT
*/

/**
 * Replace source code segments by character position, tracking cumulative offsets
 * from prior replacements so later positions stay correct.
 *
 * @constructor
 * @param {string} srcCode
 */
module.exports = function( srcCode ) {
  var diffs = [];

  return {
    get: function() {
      return srcCode;
    },

    toString: function() {
      var reSlash = /\"/gm,
          reLf = /\r/gm,
          reCr = /\n+/gm;
      srcCode = "\tmodule.exports = \"" + srcCode
        .replace( reSlash, "\\\"" )
        .replace( reLf, "\\r" )
        .replace( reCr, "\\n" ) +
        "\"";
    },

    /**
     * @param {number} lPos
     * @param {number} rPos
     * @param {string} substr
     * @returns {string}
     */
    replace: function( lPos, rPos, substr ) {
      var leftOffset, rightOffset;
      if ( lPos > rPos ) {
        throw new RangeError( "Left position must be lesser than right one" );
      }
      leftOffset = this.inferOffset( lPos );
      rightOffset = this.inferOffset( rPos );
      srcCode = srcCode.substr( 0, lPos + leftOffset ) + substr + srcCode.substr( rPos + rightOffset );
      this.updateOffset( lPos, rPos, substr );
      return srcCode;
    },

    /**
     * @param {number} lPos
     * @param {number} rPos
     * @param {string} substr
     */
    updateOffset: function( lPos, rPos, substr ) {
      var offset = lPos - rPos + substr.length;
      diffs.push({ pos: lPos, offset: offset });
    },

    /**
     * @param {number} pos
     * @returns {number}
     */
    inferOffset: function( pos ) {
      var offset = 0;
      diffs.forEach( function( diff ) {
        if ( pos > diff.pos ) {
          offset += diff.offset;
        }
      });
      return offset;
    }
  };
};
