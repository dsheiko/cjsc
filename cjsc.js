var main = require( "./cjsc-module" );
try {
 main( process.argv );
} catch ( err ) {
  console.error( " " + err.message || err );
	process.exit( 1 );
}
