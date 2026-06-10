"use strict";

var Replacer = require( "../../lib/Replacer" );

describe( "Replacer", function() {

  describe( "with '123456789'", function() {
    var replacer;

    beforeEach( function() {
      replacer = new Replacer( "123456789" );
    });

    it( "replaces a single range", function() {
      replacer.replace( 3, 4, "---------" );
      expect( replacer.get() ).toBe( "123---------56789" );
    });

    it( "handles two sequential replacements with correct offsets", function() {
      replacer.replace( 3, 4, "---------" );
      replacer.replace( 5, 5, "***" );
      expect( replacer.get() ).toBe( "123---------5***6789" );
    });

    it( "handles three sequential replacements with correct offsets", function() {
      replacer.replace( 3, 4, "---------" );
      replacer.replace( 5, 5, "***" );
      replacer.replace( 7, 7, "+" );
      expect( replacer.get() ).toBe( "123---------5***67+89" );
    });

    it( "throws when left position is greater than right", function() {
      expect( function() {
        replacer.replace( 5, 3, "x" );
      }).toThrow( RangeError );
    });
  });

  describe( "with real CommonJS code", function() {
    var src =
      "console.log( \"main.js running...\" );\n" +
      " console.log(require( \"./lib/dep1\" ));\n" +
      " console.log(require( \"./lib/dep1\" ));\n";

    var replacer;

    beforeEach( function() {
      replacer = new Replacer( src );
    });

    it( "replaces the first require call", function() {
      replacer.replace( 50, 73, "require( \"/repos/cjsc/demo/lib/dep1.js\" )" );
      expect( replacer.get() ).toBe(
        "console.log( \"main.js running...\" );\n" +
        " console.log(require( \"/repos/cjsc/demo/lib/dep1.js\" ));\n" +
        " console.log(require( \"./lib/dep1\" ));\n"
      );
    });

    it( "replaces the second require call", function() {
      replacer.replace( 89, 112, "require( \"/repos/cjsc/demo/lib/dep1.js\" )" );
      expect( replacer.get() ).toBe(
        "console.log( \"main.js running...\" );\n" +
        " console.log(require( \"./lib/dep1\" ));\n" +
        " console.log(require( \"/repos/cjsc/demo/lib/dep1.js\" ));\n"
      );
    });

    it( "replaces both require calls sequentially", function() {
      replacer.replace( 50, 73, "require( \"/repos/cjsc/demo/lib/dep1.js\" )" );
      replacer.replace( 89, 112, "require( \"/repos/cjsc/demo/lib/dep1.js\" )" );
      expect( replacer.get() ).toBe(
        "console.log( \"main.js running...\" );\n" +
        " console.log(require( \"/repos/cjsc/demo/lib/dep1.js\" ));\n" +
        " console.log(require( \"/repos/cjsc/demo/lib/dep1.js\" ));\n"
      );
    });
  });

  describe( "toString", function() {
    it( "converts content to a module.exports string assignment", function() {
      var replacer = new Replacer( "hello\nworld" );
      replacer.toString();
      expect( replacer.get() ).toContain( "module.exports" );
      expect( replacer.get() ).toContain( "hello" );
    });

    it( "escapes double quotes", function() {
      var replacer = new Replacer( "say \"hi\"" );
      replacer.toString();
      expect( replacer.get() ).toContain( "\\\"hi\\\"" );
    });
  });

});
