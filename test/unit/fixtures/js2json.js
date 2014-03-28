/**
 /*
 * Utility to build files contaning esprima syntax trees based on found in a given dir source code files
 * Example:
 * > node test/fixtures/js2json.js
 * > ../case1.ok.json created
 * > ../case1.fail.json created
 */
var fs = require('fs'),
    path = require('path'),
    esprima = require('esprima'),
    fixDir = path.resolve( __dirname ),
    dir,
		/**
		 *
		 * @param {string} pathArg
		 * @param {string} file
		 */
    jsToJson = function( pathArg, file ) {
      var re = /\.js$/g,
          reR = /\r/g,
          srcCode = fs.readFileSync( path.resolve( pathArg, file ), 'utf-8' ).replace( reR, "" ),
          destFullPath = path.resolve( pathArg, file.replace( re, ".json") );


      tree = esprima.parse( srcCode, {
          range: true,
          tokens: true,
          loc: true
        });

      if ( tree ) {
        fs.writeFileSync( destFullPath, JSON.stringify( tree ), 'utf-8' );
        console.log( destFullPath + " created" );
      }
    };

root = fs.readdirSync( fixDir );
root.forEach(function( dirName ){
	var resPath = path.resolve( fixDir, dirName );
	if ( !fs.statSync( resPath ).isDirectory() ) {
		return;
	}
	dir = fs.readdirSync( resPath );
	if ( dir ) {
		dir.forEach(function( file ){
			var stat, re = /\.js$/gi;
			stat = fs.statSync( path.resolve( resPath, file ) );
			stat.isFile() && re.test( file ) && jsToJson( resPath, file );
		});
	}
});
