var async = require( "async" ),
    aCall = function( id, done ){
      var ms = Math.random() * 1000 + 1;
      global.setTimeout(function(){
        console.log( id + "done " );
        done();
      }, ms );
    },
    sequence = function( sid, sDone ){
      async.each([ 1, 2, 3 ], function( id, done ){
        aCall( "S#" + sid + ":" + id, done );
      }, function( res ){
        console.log( "All done S#" + sid );
        sDone();
      });
    };




/*jshint -W068 */
/*jshint multistr: true */
/** @type {function} Compiler constructor */


require( "should" );

describe( "async", function( allDone ){
    it( "resolve recursive async calls", function(){

     async.each([ 1, 2, 3 ], function( id, done ){
        sequence( id, done );
     }, function( res ){
        console.log( "Completely done " );
        allDone();
     });

      cli.plugins[ 0 ].plugin.should.eql( "plugin" );
      cli.plugins[ 0 ].targets.replace.to.should.eql( 42 );
      cli.plugins[ 1 ].plugin.should.eql( "foo" );
    });
  });