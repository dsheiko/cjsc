"use strict";

var Cli = require( "../../lib/Cli" ),
    FileSystem = require( "../../lib/FileSystem" ),
    path = require( "path" );

var FIXTURES = path.resolve( __dirname, "../fixtures" );

describe( "FileSystem", function() {

  describe( "readStream", function() {
    it( "reads a file asynchronously", function( done ) {
      var cli = new Cli();
      cli.srcPath = FIXTURES + "/test-src.js";
      var fSys = new FileSystem( cli );

      fSys.readStream( FIXTURES + "/test-src.js", function( txt ) {
        expect( txt.length ).toBeGreaterThan( 0 );
        done();
      });
    });

    it( "pipes a transform plugin and applies it", function( done ) {
      var cli = new Cli();
      cli.srcPath = FIXTURES + "/test-src.js";
      cli.options.transform = [
        {
          target: path.resolve( FIXTURES + "/test-plugin.js" ),
          options: {
            replace: [ "{ \"from\": \"0.0.1\", \"to\": \"*.*.*\" }" ]
          }
        }
      ];
      var fSys = new FileSystem( cli );

      fSys.readStream( FIXTURES + "/test-src.js", function( txt ) {
        expect( txt.trim() ).toBe( "var rev = \"*.*.*\";" );
        done();
      });
    });
  });

  describe( "resolveFilename", function() {
    it( "resolves a relative path to project-relative form", function() {
      var cli = new Cli();
      cli.srcPath = FIXTURES + "/test-src.js";
      var fSys = new FileSystem( cli );

      var resolved = fSys.resolveFilename( FIXTURES + "/test-src.js" );
      expect( resolved ).not.toContain( process.cwd() );
      expect( resolved ).toMatch( /test-src\.js$/ );
    });

    it( "throws when file does not exist", function() {
      var cli = new Cli();
      cli.srcPath = FIXTURES + "/test-src.js";
      var fSys = new FileSystem( cli );

      expect( function() {
        fSys.resolveFilename( "/nonexistent/path/to/file.js" );
      }).toThrow( ReferenceError );
    });
  });

  describe( "fileExists", function() {
    it( "returns path when file exists", function() {
      var cli = new Cli();
      cli.srcPath = FIXTURES + "/test-src.js";
      var fSys = new FileSystem( cli );

      expect( fSys.fileExists( FIXTURES + "/test-src.js" ) ).toBeTruthy();
    });

    it( "returns false when file does not exist", function() {
      var cli = new Cli();
      cli.srcPath = FIXTURES + "/test-src.js";
      var fSys = new FileSystem( cli );

      expect( fSys.fileExists( "/no/such/file.js" ) ).toBe( false );
    });

    it( "throws when argument is not a string", function() {
      var cli = new Cli();
      cli.srcPath = FIXTURES + "/test-src.js";
      var fSys = new FileSystem( cli );

      expect( function() {
        fSys.fileExists( 42 );
      }).toThrow( TypeError );
    });
  });

  describe( "getFixedFileName", function() {
    it( "replaces backslashes with forward slashes", function() {
      var cli = new Cli();
      cli.srcPath = FIXTURES + "/test-src.js";
      var fSys = new FileSystem( cli );

      expect( fSys.getFixedFileName( "foo\\bar\\baz.js" ) ).toBe( "foo/bar/baz.js" );
    });
  });

});
