/*jshint -W068 */
/*jshint multistr: true */
		/** @type {function} Parser constructor */
var Parser = require( "../lib/Parser" ),
		/** @type {fixture} module */
		fixture = require( "./inc/fixture" ),
		/**
		 *
		 * @param {string} id
		 * @param {number[]} range
		 * @returns {DependencyEntityStub}
		 */
		DependencyEntityStub = function( id, range ) {
			return {
				/** @type {string} */
				id: id,
				/** @type {string} */
				filename: id,
				/** @type {number[]} */
				range: range
			};
		},
		/**
		 * @param {string} code
		 * @param {number[]} range
		 * @returns {string}
		 */
		getExcerpt = function( code, range ) {
			return code.substr( range[ 0 ], range[ 1 ] - range[ 0 ] );
		};

require( "should" );

describe( "Parser", function(){
	describe( ".getDependecies ", function(){
		var parser;
		beforeEach(function(){
			parser = new Parser( DependencyEntityStub );
		});
		it( "must extract all the occurances of require", function(){
			var src = fixture.getText( "Parser/case1.js" ),
					map = parser.getDependecies( fixture.getJson( "Parser/case1.json" ) );
			map[ 0 ].id.should.eql( "./foo" );
			map[ 1 ].id.should.eql( "./bar" );
			map[ 2 ].id.should.eql( "./bar" );
			getExcerpt( src, map[ 0 ].range ).should.eql( "require( \"./foo\" )" );
			getExcerpt( src, map[ 1 ].range ).should.eql( "require( \"./bar\" )" );
			getExcerpt( src, map[ 2 ].range ).should.eql( "require( \"./bar\" )" );
		});
	});

});