/*jshint -W068 */
/*jshint multistr: true */
/** @type {function} Compiler constructor */
var Cli = require( "../../lib/Cli" ),
    fs = require( "fs" ),
    through = require( "through2" ),
    pipe = function(){
      var code = "";
      return through.obj(function (buf, enc, next) {
          /*  accumulate the code chunks  */
          code += buf.toString( "utf8" );
          next();
      }, function ( next ) {
          code = code.replace( "1", "2" );
          this.push( new Buffer( code ) );
          next();
      });
    };

require( "should" );

describe( "lib/Cli", function(){
  describe( "parseTransformOptions", function(){
    it( "parses command line correctly", function(){
      var cli = new Cli( "..", process.cwd(), {}, {} ),
          line = "demo/use-main-flow.js /tmp/out.js -t [ plugin --replace { \"from\": \"\\\\$foo\", \"to\": 42 } ] -t [ foo --nope ]";
      cli.parseTransformOptions( line.split( " " ));
      cli.plugins[ 0 ].plugin.should.eql( "plugin" );
      cli.plugins[ 0 ].targets.replace.to.should.eql( 42 );
      cli.plugins[ 1 ].plugin.should.eql( "foo" );
    });
  });
  describe( "parsePluginOptions", function(){
    it( "parses command line correctly", function(){
      var cli = new Cli( "..", process.cwd(), {}, {} ),
          line = "demo/use-main-flow.js /tmp/out.js -p plugin --plugin=foo";
      cli.parsePluginOptions( line.split( " " ));
      cli.plugins[ 0 ].plugin.should.eql( "plugin" );
      cli.plugins[ 1 ].plugin.should.eql( "foo" );
    });
  });

});
