console.log( "main.js running..." );
console.log( "Imported name in main.js is `%s`", require( "./lib/dep1" ).name );
console.log( "Getting imported object from the cache:" );
console.log( " imported name in main.js is still `%s`", require( "./lib/dep1" ).name );