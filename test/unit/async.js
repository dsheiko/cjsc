/*jshint -W068 */
/*jshint multistr: true */
/** @type {function} Compiler constructor */
var async = require( "async" ),
    aCall = function( id, done ){
      var ms = Math.random() * 1000 + 1;
      global.setTimeout(function(){
        done();
      }, ms );
    },
    sequence = function( sid, sDone ){
      async.each([ 1, 2, 3 ], function( id, done ){
        aCall( "S#" + sid + ":" + id, done );
      }, function(){
        sDone();
      });
    };

require( "should" );

describe( "async", function( allDone ){
    it( "resolve recursive async calls", function(){
     async.each([ 1, 2, 3 ], function( id, done ){
        sequence( id, done );
     }, function(){
        ( true ).should.be.ok;
        allDone();
     });
    });
  });