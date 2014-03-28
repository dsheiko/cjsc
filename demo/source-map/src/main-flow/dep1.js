console.log( "dep1.js running..." );
console.log( " it has __diname = `%s`", __dirname );
console.log( " it has __filename = `%s`", __filename );
console.log( "Imported name in dep1.js is `%s`", require( "./dep2" ).name );
exports.name = "dep1";