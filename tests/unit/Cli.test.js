"use strict";

var Cli = require( "../../lib/Cli" );

describe( "Cli", function() {

  describe( "run", function() {
    it( "parses basic command line arguments", function() {
      var cli = new Cli(),
          args = [
            "node", "cjsc.js",
            "-C", "config.json",
            "--minify",
            "--debug",
            "-o", "build.js",
            "source.js"
          ];

      cli.run( args );

      expect( cli.options.minify ).toBeTruthy();
      expect( cli.options.debug ).toBeTruthy();
      expect( cli.options.output ).toBe( "build.js" );
      expect( cli.srcPath ).toBe( "source.js" );
      expect( cli.destPath ).toBe( "build.js" );
      expect( cli.options.config ).toBe( "config.json" );
    });

    it( "parses transform sub-args (browserify syntax)", function() {
      var cli = new Cli(),
          args = [
            "node", "cjsc.js",
            "-t", "[",
              "browserify-replace",
              "--replace", "{ \"from\": \"\\\\$foo\", \"to\": 42 }",
              "--replace", "{ \"from\": \"\\\\$bar\", \"to\": \"quux\" }",
            "]",
            "-o", "build.js",
            "source.js"
          ],
          cfg, foo, bar;

      cli.run( args );

      cfg = cli.options.transform[ 0 ];
      expect( cfg ).toHaveProperty( "target" );
      expect( cfg.target ).toBe( "browserify-replace" );
      expect( cfg.options ).toHaveProperty( "replace" );

      foo = JSON.parse( cfg.options.replace[ 0 ] );
      bar = JSON.parse( cfg.options.replace[ 1 ] );
      expect( foo.to ).toBe( 42 );
      expect( bar.to ).toBe( "quux" );
    });

    it( "sets both srcPath and destPath from positional args", function() {
      var cli = new Cli(),
          args = [ "node", "cjsc.js", "input.js", "output.js" ];

      cli.run( args );

      expect( cli.srcPath ).toBe( "input.js" );
      expect( cli.destPath ).toBe( "output.js" );
    });

    it( "accepts object form (programmatic API)", function() {
      var cli = new Cli();

      cli.run({
        targets: [ "input.js", "output.js" ],
        options: { debug: true }
      });

      expect( cli.srcPath ).toBe( "input.js" );
      expect( cli.destPath ).toBe( "output.js" );
      expect( cli.options.debug ).toBe( true );
    });
  });

  describe( "findOpt", function() {
    it( "finds option by full name", function() {
      var cli = new Cli();
      expect( cli.findOpt( "minify" ) ).toBe( "minify" );
    });

    it( "finds option by short alias", function() {
      var cli = new Cli();
      expect( cli.findOpt( "M" ) ).toBe( "minify" );
    });

    it( "returns false for unknown key", function() {
      var cli = new Cli();
      expect( cli.findOpt( "nonexistent" ) ).toBe( false );
    });
  });

  describe( "getProjectInfo", function() {
    it( "returns project name and version", function() {
      var cli = new Cli(),
          info = cli.getProjectInfo();
      expect( info.name ).toBe( "cjsc" );
      expect( info.version ).toBeDefined();
    });
  });

});
