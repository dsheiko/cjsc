"use strict";

var Compiler = require( "../../lib/Compiler" );

describe( "Compiler", function() {

  describe( "preventAnInfiniteLoops", function() {

    describe( "safe dependency chains", function() {
      it( "handles a linear chain", function() {
        var map = {
              "main.js": [ { filename: "dep1.js" } ],
              "dep1.js": [ { filename: "dep2.js" } ],
              "dep2.js": [ { filename: "dep3.js" } ]
            },
            compiler = new Compiler( null, null );
        expect( compiler.preventAnInfiniteLoops( "main.js", map ) ).toBe( true );
      });

      it( "handles shared dependency (diamond shape)", function() {
        var map = {
              "main.js": [ { filename: "dep1.js" }, { filename: "dep2.js" } ],
              "dep1.js": [ { filename: "dep2.js" } ],
              "dep2.js": [ { filename: "dep3.js" } ]
            },
            compiler = new Compiler( null, null );
        expect( compiler.preventAnInfiniteLoops( "main.js", map ) ).toBe( true );
      });

      it( "handles module with no dependencies", function() {
        var map = {
              "main.js": [],
              "dep1.js": []
            },
            compiler = new Compiler( null, null );
        expect( compiler.preventAnInfiniteLoops( "main.js", map ) ).toBe( true );
      });
    });

    describe( "circular dependency detection", function() {
      it( "throws when a module requires itself", function() {
        var map = {
              "main.js": [ { filename: "main.js" } ]
            },
            compiler = new Compiler( null, null );
        expect( function() {
          compiler.preventAnInfiniteLoops( "main.js", map );
        }).toThrow();
      });

      it( "throws on a 2-module loop", function() {
        var map = {
              "main.js": [ { filename: "dep1.js" } ],
              "dep1.js": [ { filename: "main.js" } ]
            },
            compiler = new Compiler( null, null );
        expect( function() {
          compiler.preventAnInfiniteLoops( "main.js", map );
        }).toThrow();
      });

      it( "throws on a 3-module loop", function() {
        var map = {
              "main.js": [ { filename: "dep1.js" } ],
              "dep1.js": [ { filename: "dep2.js" } ],
              "dep2.js": [ { filename: "main.js" } ]
            },
            compiler = new Compiler( null, null );
        expect( function() {
          compiler.preventAnInfiniteLoops( "main.js", map );
        }).toThrow();
      });

      it( "throws when a dep requires its sibling in a cycle", function() {
        var map = {
              "main.js": [ { filename: "dep1.js" } ],
              "dep1.js": [ { filename: "dep2.js" } ],
              "dep2.js": [ { filename: "dep1.js" } ]
            },
            compiler = new Compiler( null, null );
        expect( function() {
          compiler.preventAnInfiniteLoops( "main.js", map );
        }).toThrow();
      });

      it( "throws when a dep requires itself", function() {
        var map = {
              "main.js": [ { filename: "dep1.js" } ],
              "dep1.js": [ { filename: "dep2.js" } ],
              "dep2.js": [ { filename: "dep2.js" } ]
            },
            compiler = new Compiler( null, null );
        expect( function() {
          compiler.preventAnInfiniteLoops( "main.js", map );
        }).toThrow();
      });
    });
  });

});
