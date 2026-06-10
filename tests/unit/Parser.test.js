"use strict";

var Parser = require( "../../lib/Parser" ),
    fs = require( "fs" ),
    path = require( "path" );

var FIXTURES = path.join( __dirname, "../fixtures" );

function getText( name ) {
  return fs.readFileSync( path.join( FIXTURES, name ), "utf-8" ).replace( /\r/g, "" );
}

function getJson( name ) {
  return JSON.parse( getText( name ) );
}

function DependencyStub( id, range ) {
  return { id: id, filename: id, range: range };
}

function getExcerpt( code, range ) {
  return code.substr( range[ 0 ], range[ 1 ] - range[ 0 ] );
}

describe( "Parser", function() {

  describe( "getDependecies", function() {
    var parser;

    beforeEach( function() {
      parser = new Parser( DependencyStub );
    });

    it( "extracts all require() occurrences", function() {
      var src = getText( "Parser/case1.js" ),
          map = parser.getDependecies( getJson( "Parser/case1.json" ) );

      expect( map[ 0 ].id ).toBe( "./foo" );
      expect( map[ 1 ].id ).toBe( "./bar" );
      expect( map[ 2 ].id ).toBe( "./bar" );
      expect( getExcerpt( src, map[ 0 ].range ) ).toBe( "require( \"./foo\" )" );
      expect( getExcerpt( src, map[ 1 ].range ) ).toBe( "require( \"./bar\" )" );
      expect( getExcerpt( src, map[ 2 ].range ) ).toBe( "require( \"./bar\" )" );
    });

    it( "returns empty array for code with no require calls", function() {
      var tree = parser.getSyntaxTree( "var x = 1;" ),
          deps = parser.getDependecies( tree );
      expect( deps ).toHaveLength( 0 );
    });

    it( "ignores require calls with non-string arguments", function() {
      var tree = parser.getSyntaxTree( "require( someVar );" ),
          deps = parser.getDependecies( tree );
      expect( deps[ 0 ].id ).toBeUndefined();
    });
  });

  describe( "getRequirements", function() {
    var parser;

    beforeEach( function() {
      parser = new Parser( DependencyStub );
    });

    it( "detects __dirname usage", function() {
      var tree = parser.getSyntaxTree( "console.log( __dirname );" ),
          req = parser.getRequirements( tree );
      expect( req.__dirname ).toBe( true );
    });

    it( "detects __filename usage", function() {
      var tree = parser.getSyntaxTree( "console.log( __filename );" ),
          req = parser.getRequirements( tree );
      expect( req.__filename ).toBe( true );
    });

    it( "detects exports shortcut (member expression)", function() {
      var tree = parser.getSyntaxTree( "exports.foo = 1;" ),
          req = parser.getRequirements( tree );
      expect( req.shortcut ).toBe( true );
    });

    it( "detects exports shortcut (assignment)", function() {
      var tree = parser.getSyntaxTree( "exports = { foo: 1 };" ),
          req = parser.getRequirements( tree );
      expect( req.shortcut ).toBe( true );
    });

    it( "returns false for none of the globals", function() {
      var tree = parser.getSyntaxTree( "var x = 42;" ),
          req = parser.getRequirements( tree );
      expect( req.__dirname ).toBe( false );
      expect( req.__filename ).toBe( false );
      expect( req.shortcut ).toBe( false );
    });
  });

  describe( "getSyntaxTree", function() {
    var parser;

    beforeEach( function() {
      parser = new Parser( DependencyStub );
    });

    it( "parses valid JavaScript", function() {
      var tree = parser.getSyntaxTree( "var x = 1;" );
      expect( tree.type ).toBe( "Program" );
    });

    it( "throws on invalid JavaScript", function() {
      expect( function() {
        parser.getSyntaxTree( "{{{{" );
      }).toThrow();
    });
  });

});
