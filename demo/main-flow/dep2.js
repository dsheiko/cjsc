console.log( "dep2.js running..." );
console.log( "Imported name in dep2.js is `%s`", require( "./submodule/dep3" ).name );
console.log( "Imported name in dep2.js is `%s`", require( "./submodule/dep4" ).name );
module.exports.name = "dep2";