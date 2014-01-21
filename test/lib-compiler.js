/*jshint -W068 */
/*jshint multistr: true */
		/** @type {function} Compiler constructor */
var Compiler = require( "../lib/Compiler" ),
		/** @type {fixture} module */
		fixture = require( "./inc/fixture" );
require( "should" );

describe( "Compiler", function(){

	describe( ".preventAnInfiniteLoops ", function(){

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

	describe( ".findDependencies ", function(){
		var cliStub = {
					resolveFilename: function( fname ) {
						return fname + ".json";
					},
					readJs: function( fname ) {
						return fname;
					}
				},
				parserStub = {
					getSyntaxTree: function( fname ) {
						return fname;
					},
					getDependecies: function( fname ) {
						return fixture.getJson( "Compiler/" + fname );
					}
				};


		it( "must propertly populate dependency ", function(){
			var compiler = new Compiler( parserStub, cliStub ),
					deps = compiler.findDependencies( "main.json" );

			deps["main.json"][ 0 ].id.should.eql( "foo" );
			deps["foo.json"][ 0 ].id.should.eql( "bar" );
		});

	});
});


