/*jshint -W068 */
/*jshint multistr: true */
/** @type {function} Compiler constructor */
var Cli = require( "../../lib/Cli" ),
    FSys = require( "../../lib/FileSystem" ),
     /** @module path */
    npath = require( "path" );

require( "should" );

describe( "lib/FileSystem", function(){

  describe( "readStream", function(){

    it( "reads file async", function( done ){
      var fSys = new FSys( new Cli() );
      fSys.readStream( __dirname + "/fixtures/test-src.js", function( txt ){
        txt.length.should.be.ok;
        done();
      });
    });

    it( "pipe in read file / perform plugin", function( done ){
      var cli = new Cli();
        cli.options.transform = [
        {
          target: npath.resolve( __dirname + "/fixtures/test-plugin.js" ),
          options: {
            replace: [ "{ \"from\": \"0.0.1\", \"to\": \"*.*.*\" }" ]
          }
        }
      ];
      fSys = new FSys( cli );
      fSys.readStream( __dirname + "/fixtures/test-src.js", function( txt ){
        txt.length.should.be.ok;
        txt.trim().should.equal( "var rev = \"*.*.*\";" );
        done();
      });
    });
  });




});
