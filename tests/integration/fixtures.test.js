"use strict";

var vm = require( "vm" ),
    os = require( "os" ),
    path = require( "path" ),
    cjsc = require( "../../cjsc-module" );

var ROOT = path.resolve( __dirname, "../.." );
var FIXTURES = path.join( ROOT, "test/integration/fixtures" );

beforeAll( function() {
  jest.spyOn( console, "log" ).mockImplementation( function() {} );
});

afterAll( function() {
  console.log.mockRestore();
});

/**
 * Compile a fixture and execute the bundle in a vm context that simulates
 * a browser environment where `window === global`.
 *
 * @param {string} fixture - path relative to FIXTURES
 * @param {Object} [options] - cjsc options (e.g. { config: "path" })
 * @param {Object} [extras] - extra properties to seed on the global/window
 * @returns {Promise<string[]>}
 */
function compile( fixture, options, extras ) {
  return new Promise( function( resolve, reject ) {
    var src = path.join( FIXTURES, fixture ),
        dest = path.join( os.tmpdir(), "cjsc-test-" + Date.now() + "-" + Math.random() + ".js" ),
        args = {
          targets: [ src, dest ],
          options: options || {}
        };

    cjsc( args, null, function( code ) {
      // Simulate browser: window IS the global object so that
      // `window.foo = x` and bare `foo` resolve to the same thing.
      var sandbox = Object.assign( {}, extras || {} );
      sandbox.window = sandbox;
      sandbox.log = sandbox.log || [];

      vm.createContext( sandbox );
      try {
        vm.runInContext( code, sandbox );
        resolve( sandbox.log );
      } catch ( e ) {
        reject( e );
      }
    });
  });
}

describe( "Integration: generic flow", function() {
  it( "resolves module factories, caches modules, exposes __filename and __dirname", function() {
    return compile( "generic/main.js" ).then( function( log ) {
      expect( log.join( ";" ) ).toBe(
        "main.js:runs;" +
        "dep1.js:runs;" +
        "dep1.js:__diname:test/integration/fixtures/generic/module;" +
        "dep1.js:__filename:test/integration/fixtures/generic/module/dep1.js;" +
        "dep2.js:runs;" +
        "dep1.js:exports:dep2-import;" +
        "main.js:exports:dep1-import;" +
        "main.js:caches:dep1-import"
      );
    });
  });
});

describe( "Integration: UMD flow", function() {
  it( "supports UMD modules and exposes module.id", function() {
    return compile( "umd/main.js" ).then( function( log ) {
      expect( log.join( ";" ) ).toBe(
        "test/integration/fixtures/umd/main.js:runs;" +
        "test/integration/fixtures/umd/module/module1.js:runs;" +
        "test/integration/fixtures/umd/module/module2.js:runs;" +
        "test/integration/fixtures/umd/module/module1.js:exports:test/integration/fixtures/umd/module/module2.js;" +
        "test/integration/fixtures/umd/main.js:exports:test/integration/fixtures/umd/module/module1.js"
      );
    });
  });
});

describe( "Integration: non-module file", function() {
  it( "bundles a plain-text non-JS file as a string", function() {
    return compile( "non-module/main.js" ).then( function( log ) {
      expect( log.join( ";" ) ).toBe( "main.js:runs" );
    });
  });
});

describe( "Integration: 3rd-party exports", function() {
  it( "exports named globals from a non-CommonJS library", function() {
    return compile( "3rd-party/main.js" ).then( function( log ) {
      expect( log.join( ";" ) ).toBe( "exp1:export1;exp2:export2" );
    });
  });
});

describe( "Integration: Mustache templating", function() {
  it( "compiles and renders a Mustache template", function() {
    return compile( "mustache/main.js" ).then( function( log ) {
      expect( log.join( ";" ) ).toBe( "Joe;; spends 6" );
    });
  });
});

describe( "Integration: Handlebars templating", function() {
  it( "compiles and renders a Handlebars template", function() {
    return compile( "handlebars/main.js" ).then( function( log ) {
      expect( log.join( ";" ) ).toBe(
        "<div class=\"entry\">;;" +
        "  <h1>My New Post</h1>;;" +
        "  <div class=\"body\">;;" +
        "    This is my first post!;;" +
        "  </div>;;" +
        "</div>"
      );
    });
  });
});

describe( "Integration: globalProperty config", function() {
  it( "maps a globally exposed variable to a require-able module", function() {
    var configPath = path.join( FIXTURES, "dependency-config/reference/config.json" );
    return compile(
      "dependency-config/reference/main.js",
      { config: configPath },
      { jQuery: "this is a jQuery instance" }
    ).then( function( log ) {
      expect( log.join( ";" ) ).toBe( "this is a jQuery instance" );
    });
  });
});

describe( "Integration: module alias config", function() {
  it( "resolves a require id to an aliased file path", function() {
    var configPath = path.join( FIXTURES, "dependency-config/alias/config.json" );
    return compile( "dependency-config/alias/main.js", { config: configPath } ).then( function( log ) {
      expect( log.join( ";" ) ).toBe( "module" );
    });
  });
});

describe( "Integration: single require + export config", function() {
  it( "injects a configured require and exports the result", function() {
    var configPath = path.join( FIXTURES, "dependency-config/require-a/config.json" );
    return compile( "dependency-config/require-a/main.js", { config: configPath } ).then( function( log ) {
      expect( log.join( ";" ) ).toBe( "jQuery;plugin" );
    });
  });
});

describe( "Integration: multiple requires + exports config", function() {
  it( "injects multiple requires and exports multiple globals", function() {
    var configPath = path.join( FIXTURES, "dependency-config/require-b/config.json" );
    return compile(
      "dependency-config/require-b/main.js",
      { config: configPath },
      { globalA: "globalA", globalB: "globalB" }
    ).then( function( log ) {
      expect( log.join( ";" ) ).toBe(
        "{\"globalC\":\"globalC + globalA\",\"globalD\":\"globalD + globalB\"}"
      );
    });
  });
});
