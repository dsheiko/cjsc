
(function( global ) {
		global.log = [];
		load = function( file, cb ) {
			var script = document.createElement( "script" );
			script.type = "text/javascript";
			script.src = file;
			global.document.body.appendChild( script );
			script.addEventListener( "load", cb );
		},
    runTests = function() {
			asyncTest( "generic flow tests dependency factory, module cache, import, path resolution and __filename/__dir", function() {
				expect( 1 );
				global.log = [];
				load( "./build/generic.js", function(){
					ok ( global.log.join( ";" ) === "main.js:runs;dep1.js:runs;dep1.js:__diname:test/integration/fixtures/generic/module;dep1.js:__filename:test/integration/fixtures/generic/module/dep1.js;dep2.js:runs;dep1.js:exports:dep2-import;main.js:exports:dep1-import;main.js:caches:dep1-import",
						"as expected");
					start();
				});
			});

			asyncTest( "umd flow tests UMD support, module object id property", function() {
				expect( 1 );
				global.log = [];
				load( "./build/umd.js", function(){
					ok ( global.log.join( ";" ) === "test/integration/fixtures/umd/main.js:runs;test/integration/fixtures/umd/module/module1.js:runs;test/integration/fixtures/umd/module/module2.js:runs;test/integration/fixtures/umd/module/module1.js:exports:test/integration/fixtures/umd/module/module2.js;test/integration/fixtures/umd/main.js:exports:test/integration/fixtures/umd/module/module1.js",
						"as expected");
					start();
				});
			});

			asyncTest( "non-module flow", function() {
				expect( 1 );
				global.log = [];
				load( "./build/non-module.js", function(){
					ok ( global.log.join( ";" ) === "main.js:runs",
						"as expected");
					start();
				});
			});

			asyncTest( "3rd-party flow", function() {
				expect( 1 );
				global.log = [];
				load( "./build/3rd-party.js", function(){
					ok ( global.log.join( ";" ) === "exp1:export1;exp2:export2",
						"as expected");
					start();
				});
			});

			asyncTest( "Templating with Mustache", function() {
				expect( 1 );
				global.log = [];
				load( "./build/mustache.js", function(){
					ok ( global.log.join( ";" ) === "Joe;; spends 6",
						"as expected");
					start();
				});
			});

			asyncTest( "Templating with HandlebarsJs", function() {
				expect( 1 );
				global.log = [];
				load( "./build/handlebars.js", function(){
					ok ( global.log.join( ";" ) === "<div class=\"entry\">;;  <h1>My New Post</h1>;;  <div class=\"body\">;;    This is my first post!;;  </div>;;</div>",
						"as expected");
					start();
				});
			});

			asyncTest( "Module of a globaly exposed variable", function() {
				expect( 1 );
				global.log = [];
				window.jQuery = "this is a jQuery instance";
				load( "./build/dependency-config-reference.js", function(){
					ok ( global.log.join( ";" ) === "this is a jQuery instance",
						"as expected");
					start();
				});
			});

			asyncTest( "Configuring module aliases", function() {
				expect( 1 );
				global.log = [];
				load( "./build/dependency-config-alias.js", function(){
					ok ( global.log.join( ";" ) === "module",
						"as expected");
					start();
				});
			});

			asyncTest( "Configuring a single require and a export", function() {
				expect( 1 );
				global.log = [];
				load( "./build/dependency-config-require-a.js", function(){
					ok ( global.log.join( ";" ) === "jQuery;plugin",
						"as expected");
					start();
				});
			});

			asyncTest( "Configuring multiple requires and exports", function() {
				expect( 1 );
				global.globalA = "globalA";
			  global.globalB = "globalB";
				global.log = [];
				load( "./build/dependency-config-require-b.js", function(){
					ok ( global.log.join( ";" ) === "{\"globalC\":\"globalC + globalA\",\"globalD\":\"globalD + globalB\"}",
						"as expected");
					start();
				});
			});

    };
		global.addEventListener( "DOMContentLoaded", runTests );
})( this );
