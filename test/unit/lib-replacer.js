/*jshint -W068 */
/*jshint multistr: true */
		/** @type {function} Replacer constructor */
var Replacer = require( "../../lib/Replacer" );

require( "should" );

describe( "Replacer", function(){
	describe( " with 123456789 ", function(){
		var replacer;
		beforeEach(function(){
			replacer = new Replacer( "123456789" );
		});

		it( "must", function(){
			replacer.replace( 3,4, "---------" );
			replacer.get().should.eql( "123---------56789" );
		});
		it( "must", function(){
			replacer.replace( 3,4, "---------" );
			replacer.replace( 5,5, "***" );
			replacer.get().should.eql( "123---------5***6789" );
		});
		it( "must", function(){
			replacer.replace( 3,4, "---------" );
			replacer.replace( 5,5, "***" );
			replacer.replace( 7,7, "+" );
			replacer.get().should.eql( "123---------5***67+89" );
		});
	});

	describe( " with real code ", function(){
		var replacer;
		beforeEach(function(){
			replacer = new Replacer( "console.log( \"main.js running...\" );\n\
 console.log(require( \"./lib/dep1\" ));\n\
 console.log(require( \"./lib/dep1\" ));\n" );
		});

		it( "must", function(){
			replacer.replace(  50, 73, "require( \"/repositories/home/sheiko/vhosts/os.htdocs/cjsc/demo/lib/dep1.js\" )" );
			replacer.get().should.eql( "console.log( \"main.js running...\" );\n\
 console.log(require( \"/repositories/home/sheiko/vhosts/os.htdocs/cjsc/demo/lib/dep1.js\" ));\n\
 console.log(require( \"./lib/dep1\" ));\n" );
		});
		it( "must", function(){
			replacer.replace(  89, 112, "require( \"/repositories/home/sheiko/vhosts/os.htdocs/cjsc/demo/lib/dep1.js\" )" );
			replacer.get().should.eql( "console.log( \"main.js running...\" );\n\
 console.log(require( \"./lib/dep1\" ));\n\
 console.log(require( \"/repositories/home/sheiko/vhosts/os.htdocs/cjsc/demo/lib/dep1.js\" ));\n" );
		});


		it( "must", function(){
			replacer.replace(  50, 73, "require( \"/repositories/home/sheiko/vhosts/os.htdocs/cjsc/demo/lib/dep1.js\" )" );
			replacer.replace(  89, 112, "require( \"/repositories/home/sheiko/vhosts/os.htdocs/cjsc/demo/lib/dep1.js\" )" );
						replacer.get().should.eql( "console.log( \"main.js running...\" );\n\
 console.log(require( \"/repositories/home/sheiko/vhosts/os.htdocs/cjsc/demo/lib/dep1.js\" ));\n\
 console.log(require( \"/repositories/home/sheiko/vhosts/os.htdocs/cjsc/demo/lib/dep1.js\" ));\n" );
		});
	});


});