/*jshint -W068 */
/*jshint multistr: true */
		/** @type {function} Replacer constructor */
var Replacer = require( "../lib/Replacer" ),
		/** @type {fixture} module */
		fixture = require( "./inc/fixture" );

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
			replacer.get().should.eql( "123---------567***89" );
		});
		it( "must", function(){
			replacer.replace( 3,4, "---------" );
			replacer.replace( 5,5, "***" );
			replacer.replace( 7,7, "+" );
			replacer.get().should.eql( "123---------567***89+" );
		});
	});
});