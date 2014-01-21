console.log( "dep1.js running..." );
console.log( "Imported name in dep1.js is `%s`", require( "./dep2" ).name );
exports.name = "dep1";