/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/
"use strict";

module.exports = function() {
  var cache = {};
  return {
    set: function( key, val) {
      cache[ key ] = val;
    },
    has: function( key ) {
      return typeof cache[ key ] !== "undefined";
    },
    get: function( key ) {
      var carry;
      if ( typeof cache[ key ] === "undefined" ) {
        return null;
      }
      carry = cache[ key ];
      delete cache[ key ];
      return carry;
    }
  };
};