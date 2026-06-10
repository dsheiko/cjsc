"use strict";

var ModuleRenderer = require( "../../lib/Renderer/Module" ),
    Cli = require( "../../lib/Cli" ),
    FileSystem = require( "../../lib/FileSystem" ),
    path = require( "path" );

var FIXTURES = path.resolve( __dirname, "../fixtures" );

function makeFSys() {
  var cli = new Cli();
  cli.srcPath = FIXTURES + "/test-src.js";
  return new FileSystem( cli );
}

describe( "Renderer/Module", function() {

  describe( "getOpener", function() {
    it( "wraps the module in a _require.def factory", function() {
      var fSys = makeFSys(),
          renderer = new ModuleRenderer( "my/module.js", {}, fSys ),
          opener = renderer.getOpener();
      expect( opener ).toContain( "_require.def" );
      expect( opener ).toContain( "my/module.js" );
    });
  });

  describe( "getCloser", function() {
    it( "returns a return module statement", function() {
      var fSys = makeFSys(),
          renderer = new ModuleRenderer( "my/module.js", {}, fSys ),
          closer = renderer.getCloser();
      expect( closer ).toContain( "return module" );
    });
  });

  describe( "getGlobalsDelaration", function() {
    it( "emits __dirname when required", function() {
      var fSys = makeFSys(),
          renderer = new ModuleRenderer( "src/foo/bar.js", {}, fSys ),
          code = renderer.getGlobalsDelaration( { __dirname: true, __filename: false, __modulename: false }, "foo/bar.js" );
      expect( code ).toContain( "__dirname" );
      expect( code ).toContain( "src/foo" );
    });

    it( "emits __filename when required", function() {
      var fSys = makeFSys(),
          renderer = new ModuleRenderer( "src/foo/bar.js", {}, fSys ),
          code = renderer.getGlobalsDelaration( { __dirname: false, __filename: true, __modulename: false }, "foo/bar.js" );
      expect( code ).toContain( "__filename" );
      expect( code ).toContain( "src/foo/bar.js" );
    });

    it( "returns empty string when no globals needed", function() {
      var fSys = makeFSys(),
          renderer = new ModuleRenderer( "src/foo/bar.js", {}, fSys ),
          code = renderer.getGlobalsDelaration( { __dirname: false, __filename: false, __modulename: false }, "foo/bar.js" );
      expect( code ).toBe( "" );
    });
  });

  describe( "getExportsForExternalModule", function() {
    it( "renders array of exports", function() {
      var fSys = makeFSys(),
          renderer = new ModuleRenderer( "lib.js", {}, fSys ),
          code = renderer.getExportsForExternalModule( [ "foo", "bar" ] );
      expect( code ).toContain( "module.exports.foo = foo;" );
      expect( code ).toContain( "module.exports.bar = bar;" );
    });

    it( "renders single string export", function() {
      var fSys = makeFSys(),
          renderer = new ModuleRenderer( "lib.js", {}, fSys ),
          code = renderer.getExportsForExternalModule( "myLib" );
      expect( code ).toContain( "module.exports = myLib;" );
    });

    it( "returns empty string for no exports", function() {
      var fSys = makeFSys(),
          renderer = new ModuleRenderer( "lib.js", {}, fSys ),
          code = renderer.getExportsForExternalModule( [] );
      expect( code ).toBe( "" );
    });
  });

  describe( "getExportsShortcutResolvingCode", function() {
    it( "emits shortcut resolution when shortcut is true", function() {
      var fSys = makeFSys(),
          renderer = new ModuleRenderer( "lib.js", {}, fSys ),
          code = renderer.getExportsShortcutResolvingCode( { shortcut: true } );
      expect( code ).toContain( "module.exports = exports" );
    });

    it( "returns empty string when no shortcut", function() {
      var fSys = makeFSys(),
          renderer = new ModuleRenderer( "lib.js", {}, fSys ),
          code = renderer.getExportsShortcutResolvingCode( { shortcut: false } );
      expect( code ).toBe( "" );
    });
  });

});
