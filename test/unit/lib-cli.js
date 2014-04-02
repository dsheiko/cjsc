/*jshint -W068 */
/*jshint multistr: true */
		/** @type {module:Cli} Cli constructor */
var Cli = require( "../../lib/Cli" ),
		/** @type {function} nodejs File I/O api */
		fs = require( "fs" ),
		/** @type {function} nodejs api for handling and transforming file paths */
		path = require( "path" );

require( "should" );

describe( "Cli - resolve source map files paths relative to test", function(){
	describe( " sources in 'src' ", function(){
		/** @type {module:Cli} */
		var cli,
				srcPath = "src";
		beforeEach(function(){
			cli = new Cli( srcPath, process.cwd(), fs, path );
		});

		it( "must resolve to `../src..` when source.map in `test`", function(){
			var testPath = "test/source.map",
					filename = srcPath + "/lib/file.js";
			cli.determineRelativeToSrcPath( testPath );
			cli.resolveRelativeScrPath( filename ).should.eql( "../src/lib/file.js" );
		});

		it( "must resolve to `../src..` when source.map in `test` whatever nesting of the file is", function(){
			var testPath = "test/source.map",
					filename = srcPath + "/lib/lib/lib/file.js";
			cli.determineRelativeToSrcPath( testPath );
			cli.resolveRelativeScrPath( filename ).should.eql( "../src/lib/lib/lib/file.js" );
		});

		it( "must resolve to `../..` when source.map in `test` and file is out of src", function(){
			var testPath = "test/source.map",
					filename = srcPath + "/../file.js";
			cli.determineRelativeToSrcPath( testPath );
			cli.resolveRelativeScrPath( filename ).should.eql( "../file.js" );
		});

		it( "must resolve to `../../../src..` when source.map in `../../test`", function(){
			var testPath = "../../test/source.map",
					filename = srcPath + "/lib/file.js";
			cli.determineRelativeToSrcPath( testPath );
			cli.resolveRelativeScrPath( filename ).should.eql( "../../../src/lib/file.js" );
		});

		it( "must resolve to `../../../src..` when source.map in `../../test`", function(){
			var testPath = "/test/source.map";
			(function(){
        cli.determineRelativeToSrcPath( testPath );
      }).should[ "throw" ]();
		});

	});

});

