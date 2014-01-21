/*jshint -W068 */
/*jshint multistr: true */
var Compiler = require( "../lib/Compiler" ),
		DependencyEntity;
require( "should" );

describe( "Compiler", function () {


	describe( "must not throwing exceptions on a safe call sequeence", function(){
		it( "(1)", function(){
			var map = {
						"main.js": [{ filename: "dep1.js" }],
						"dep1.js": [{ filename: "dep2.js" }],
						"dep2.js": [{ filename: "dep3.js" }]
					},
					compiler = new Compiler( null, null );
			compiler.preventAnInfiniteLoops( "main.js", map ).should.be.ok;
		});
		it( "(2)", function(){
			var map = {
						"main.js": [{ filename: "dep1.js" }, { filename: "dep2.js" }],
						"dep1.js": [{ filename: "dep2.js" }],
						"dep2.js": [{ filename: "dep3.js" }]
					},
					compiler = new Compiler( null, null );
			compiler.preventAnInfiniteLoops( "main.js", map ).should.be.ok;
		});
	});


	it( "must throw an exception when module requires itself", function(){
		var map = {
					"main.js": [{ filename: "main.js" }]
				},
				compiler = new Compiler( null, null );
		(function(){
			compiler.preventAnInfiniteLoops( "main.js", map );
		}).should[ "throw" ]();
	});

	describe( "must throw an exception when a loop found", function(){
		it( "(1)", function(){
			var map = {
						"main.js": [{ filename: "dep1.js" }],
						"dep1.js": [{ filename: "main.js" }]
					},
					compiler = new Compiler( null, null );
			(function(){
				compiler.preventAnInfiniteLoops( "main.js", map );
			}).should[ "throw" ]();
		});

		it( "(2)", function(){
			var map = {
						"main.js": [{ filename: "dep1.js" }],
						"dep1.js": [{ filename: "dep2.js" }],
						"dep2.js": [{ filename: "main.js" }]
					},
					compiler = new Compiler( null, null );
			(function(){
				compiler.preventAnInfiniteLoops( "main.js", map );
			}).should[ "throw" ]();
		});

		it( "(3)", function(){
			var map = {
						"main.js": [{ filename: "dep1.js" }],
						"dep1.js": [{ filename: "dep2.js" }],
						"dep2.js": [{ filename: "dep1.js" }]
					},
					compiler = new Compiler( null, null );
			(function(){
				compiler.preventAnInfiniteLoops( "main.js", map );
			}).should[ "throw" ]();
		});

		it( "(4)", function(){
			var map = {
						"main.js": [{ filename: "dep1.js" }],
						"dep1.js": [{ filename: "dep2.js" }],
						"dep2.js": [{ filename: "dep2.js" }]
					},
					compiler = new Compiler( null, null );
			(function(){
				compiler.preventAnInfiniteLoops( "main.js", map );
			}).should[ "throw" ]();
		});
	});

});


