"use strict";

var vm = require( "vm" ),
    fs = require( "fs" ),
    path = require( "path" );

var TEMPLATE = path.resolve( __dirname, "../../lib/Renderer/template/require.js" );

function buildRuntime() {
  var src = fs.readFileSync( TEMPLATE, "utf-8" );
  var sandbox = {};
  vm.createContext( sandbox );
  vm.runInContext( src, sandbox );
  return sandbox._require;
}

describe( "require runtime (_require)", function() {

  it( "resolves a dependency and caches the module", function() {
    var _require = buildRuntime(),
        log = [];

    _require.def( "/dep.js", function( req, exports, mod ) {
      log.push( "dep-runs" );
      mod.exports = { id: mod.id };
      return mod;
    });

    _require.def( "/main.js", function( req, exports, mod ) {
      var dep = req( "/dep.js" );
      log.push( "main-runs" );
      log.push( "dep-id:" + dep.id );
      return mod;
    });

    _require( "/main.js" );
    expect( log ).toEqual( [ "dep-runs", "main-runs", "dep-id:/dep.js" ] );
  });

  it( "caches modules (second require does not re-run factory)", function() {
    var _require = buildRuntime(),
        callCount = 0;

    _require.def( "/cached.js", function( req, exports, mod ) {
      callCount++;
      mod.exports = { value: 42 };
      return mod;
    });

    _require( "/cached.js" );
    _require( "/cached.js" );
    expect( callCount ).toBe( 1 );
  });

  it( "sets module.id and module.filename correctly", function() {
    var _require = buildRuntime(),
        capturedId,
        capturedFilename;

    _require.def( "/my-module.js", function( req, exports, mod ) {
      capturedId = mod.id;
      capturedFilename = mod.filename;
      return mod;
    });

    _require( "/my-module.js" );
    expect( capturedId ).toBe( "/my-module.js" );
    expect( capturedFilename ).toBe( "/my-module.js" );
  });

  it( "sets parent/children relationships", function() {
    var _require = buildRuntime(),
        log = [];

    _require.def( "/child.js", function( req, exports, mod ) {
      log.push( "parent:" + mod.parent.id );
      mod.exports = { id: mod.id };
      return mod;
    });

    _require.def( "/parent.js", function( req, exports, mod ) {
      var child = req( "/child.js" );
      log.push( "child-id:" + mod.children[ 0 ].id );
      return mod;
    });

    _require( "/parent.js" );
    expect( log ).toEqual( [ "parent:/parent.js", "child-id:/child.js" ] );
  });

  it( "throws when factory is not registered", function() {
    var _require = buildRuntime();
    expect( function() {
      _require( "/unregistered.js" );
    }).toThrow();
  });

  it( "exports the registered value via module.exports", function() {
    var _require = buildRuntime(),
        result;

    _require.def( "/exporter.js", function( req, exports, mod ) {
      mod.exports = { answer: 42 };
      return mod;
    });

    result = _require( "/exporter.js" );
    expect( result ).toEqual( { answer: 42 } );
  });

});
