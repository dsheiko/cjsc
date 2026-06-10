"use strict";
var through = require( "through2" );

module.exports = function( file, opts ) {
  var code = "";
  return through.obj( function( buf, enc, next ) {
    code += buf.toString( "utf8" );
    next();
  }, function( next ) {
    var cfg = JSON.parse( opts.replace[ 0 ] );
    code = code.replace( cfg.from, cfg.to );
    this.push( Buffer.from( code ) );
    next();
  });
};
