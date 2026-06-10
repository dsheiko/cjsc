"use strict";

var DependencyConfig = require( "../../lib/Entity/DependencyConfig" );

describe( "DependencyConfig", function() {

  it( "normalizes string exports to an array", function() {
    var cfg = new DependencyConfig({ exports: "MyLib" });
    expect( Array.isArray( cfg.exports ) ).toBe( true );
    expect( cfg.exports ).toContain( "MyLib" );
  });

  it( "normalizes string require to an array", function() {
    var cfg = new DependencyConfig({ require: "jQuery" });
    expect( Array.isArray( cfg.require ) ).toBe( true );
    expect( cfg.require ).toContain( "jQuery" );
  });

  it( "keeps array exports as-is", function() {
    var cfg = new DependencyConfig({ exports: [ "foo", "bar" ] });
    expect( cfg.exports ).toEqual( [ "foo", "bar" ] );
  });

  it( "defaults empty fields to null/empty", function() {
    var cfg = new DependencyConfig({});
    expect( cfg.path ).toBeNull();
    expect( cfg.globalProperty ).toBeNull();
    expect( cfg.exports ).toEqual( [] );
    expect( cfg.require ).toEqual( [] );
  });

  it( "throws when path is not a string", function() {
    expect( function() {
      new DependencyConfig({ path: 42 });
    }).toThrow( TypeError );
  });

  it( "throws when globalProperty is not a string", function() {
    expect( function() {
      new DependencyConfig({ globalProperty: true });
    }).toThrow( TypeError );
  });

  it( "throws when exports is not string or array", function() {
    expect( function() {
      new DependencyConfig({ exports: 123 });
    }).toThrow( TypeError );
  });

  it( "throws when require is not string or array", function() {
    expect( function() {
      new DependencyConfig({ require: {} });
    }).toThrow( TypeError );
  });

});
