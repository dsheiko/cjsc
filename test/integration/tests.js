
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
			QUnit.test( "generic flow tests dependency factory, module cache, import, path resolution and __filename/__dir", function( assert ) {
				var done = assert.async();
				global.log = [];
				load( "./build/generic.js", function(){
					assert.equal( global.log.join( ";" ), "main.js:runs;dep1.js:runs;dep1.js:__diname:test/integration/fixtures/generic/module;dep1.js:__filename:test/integration/fixtures/generic/module/dep1.js;dep2.js:runs;dep1.js:exports:dep2-import;main.js:exports:dep1-import;main.js:caches:dep1-import",
						"as expected" );
					done();
				});
			});

			QUnit.test( "umd flow tests UMD support, module object id property", function( assert ) {
				var done = assert.async();
				global.log = [];
				load( "./build/umd.js", function(){
					assert.equal( global.log.join( ";" ), "test/integration/fixtures/umd/main.js:runs;test/integration/fixtures/umd/module/module1.js:runs;test/integration/fixtures/umd/module/module2.js:runs;test/integration/fixtures/umd/module/module1.js:exports:test/integration/fixtures/umd/module/module2.js;test/integration/fixtures/umd/main.js:exports:test/integration/fixtures/umd/module/module1.js",
						"as expected" );
					done();
				});
			});

			QUnit.test( "non-module flow", function( assert ) {
				var done = assert.async();
				global.log = [];
				load( "./build/non-module.js", function(){
					assert.equal( global.log.join( ";" ), "main.js:runs",
						"as expected");
					done();
				});
			});

			QUnit.test( "3rd-party flow", function( assert ) {
				var done = assert.async();
				global.log = [];
				load( "./build/3rd-party.js", function(){
					assert.equal( global.log.join( ";" ), "exp1:export1;exp2:export2",
						"as expected");
					done();
				});
			});

			QUnit.test( "Templating with Mustache", function( assert ) {
				var done = assert.async();
				global.log = [];
				load( "./build/mustache.js", function(){
					assert.equal( global.log.join( ";" ), "Joe;; spends 6",
						"as expected");
					done();
				});
			});

			QUnit.test( "Templating with HandlebarsJs", function( assert ) {
				var done = assert.async();
				global.log = [];
				load( "./build/handlebars.js", function(){
					assert.equal( global.log.join( ";" ), "<div class=\"entry\">;;  <h1>My New Post</h1>;;  <div class=\"body\">;;    This is my first post!;;  </div>;;</div>",
						"as expected");
					done();
				});
			});

			QUnit.test( "Module of a globaly exposed variable", function( assert ) {
				var done = assert.async();
				global.log = [];
				window.jQuery = "this is a jQuery instance";
				load( "./build/dependency-config-reference.js", function(){
					assert.equal( global.log.join( ";" ), "this is a jQuery instance",
						"as expected");
					done();
				});
			});

			QUnit.test( "Configuring module aliases", function( assert ) {
				var done = assert.async();
				global.log = [];
				load( "./build/dependency-config-alias.js", function(){
					assert.equal( global.log.join( ";" ), "module",
						"as expected");
					done();
				});
			});

			QUnit.test( "Configuring a single require and a export", function( assert ) {
				var done = assert.async();
				global.log = [];
				load( "./build/dependency-config-require-a.js", function(){
					assert.equal( global.log.join( ";" ), "jQuery;plugin",
						"as expected");
					done();
				});
			});

			QUnit.test( "Configuring multiple requires and exports", function( assert ) {
				var done = assert.async();
				global.globalA = "globalA";
			  global.globalB = "globalB";
				global.log = [];
				load( "./build/dependency-config-require-b.js", function(){
					assert.equal( global.log.join( ";" ), "{\"globalC\":\"globalC + globalA\",\"globalD\":\"globalD + globalB\"}",
						"as expected");
					done();
				});
			});

    };
		global.addEventListener( "DOMContentLoaded", runTests );
})( this );
