var main = require( "./cjsc-module" ),
    /** @type {module:cli-color} */
    clc = require( "cli-color" );
try {
 main( process.argv );
} catch ( err ) {
  console.log( clc.red( " " + err.message || err  ) );
	process.exit( 1 );
}
