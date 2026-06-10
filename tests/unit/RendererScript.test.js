"use strict";

var ScriptRenderer = require( "../../lib/Renderer/Script" ),
    Cli = require( "../../lib/Cli" ),
    FileSystem = require( "../../lib/FileSystem" ),
    path = require( "path" );

var FIXTURES = path.resolve( __dirname, "../fixtures" );

describe( "Renderer/Script", function() {
  var renderer;

  beforeEach( function() {
    var cli = new Cli();
    cli.srcPath = FIXTURES + "/test-src.js";
    var fSys = new FileSystem( cli );
    renderer = new ScriptRenderer( fSys );
  });

  describe( "getHeader", function() {
    it( "returns non-empty string containing the require runtime", function() {
      var header = renderer.getHeader();
      expect( header.length ).toBeGreaterThan( 0 );
      expect( header ).toContain( "_require" );
    });
  });

  describe( "getFooter", function() {
    it( "returns code that calls the entry module", function() {
      var footer = renderer.getFooter( "main.js" );
      expect( footer ).toContain( "main.js" );
      expect( footer ).toContain( "_require" );
    });
  });

  describe( "getHeader + getFooter", function() {
    it( "together produce valid JavaScript", function() {
      var Parser = require( "../../lib/Parser" ),
          DependencyEntity = require( "../../lib/Entity/Dependency" ),
          parser = new Parser( DependencyEntity ),
          code = renderer.getHeader() + renderer.getFooter( "main.js" );

      expect( function() {
        parser.getSyntaxTree( code );
      }).not.toThrow();
    });
  });

});
