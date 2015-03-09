/*jshint -W068 */
/*jshint multistr: true */
/** @type {function} Compiler constructor */
var Cli = require( "../../lib/Cli" );

require( "should" );
describe( "lib/Cli", function(){
  describe( "run", function(){
    it( "parses command line correctly", function(){
      var cli = new Cli(),
          args = [
      "node",
      "cjsc.js",
      "-C",
      "config.json",
      "--minify",
      "--debug",
      "-o",
      "build.js",
      "source.js"
          ];


      cli.run( args );
      cli.options.minify.should.be.ok;
      cli.options.debug.should.be.ok;
      cli.options.output.should.equal( "build.js" );
      cli.srcPath.should.equal( "source.js" );
      cli.destPath.should.equal( "build.js" );
      cli.options.config.should.equal( "config.json" );

    });

    it( "parses sub args (transforms) correctly", function(){
      var cli = new Cli(),
          foo,
          bar,
          cfg,
          args = [
      "node",
      "cjsc.js",
      "-t",
      "[",
      "browserify-replace",
      "--replace",
      "{ \"from\": \"\\\\$foo\", \"to\": 42 }",
      "--replace",
      "{ \"from\": \"\\\\$bar\", \"to\": \"quux\" }",
      "]",
      "-o",
      "build.js",
      "source.js"
          ];


      cli.run( args );
      cfg = cli.options.transform[ 0 ];
      cfg.should.have.property( "target" );
      cfg.target.should.equal( "browserify-replace" );
      cfg.options.should.have.property( "replace" );
      foo = global.JSON.parse( cfg.options.replace[ 0 ] );
      bar = global.JSON.parse( cfg.options.replace[ 1 ] );
      foo.to.should.equal( 42 );
      bar.to.should.equal( "quux" );
    });
  });

});
