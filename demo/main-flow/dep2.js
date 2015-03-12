console.log( "dep2.js running..." );
console.log( "Imported name in dep2.js is `%s`", require( "./bar/dep-bar" ).name );
console.log( "Imported name in dep2.js is `%s`", require( "./foo/dep-foo" ).name );
module.exports.name = "dep2";