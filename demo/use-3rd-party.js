
var exp1 = require( "./3rd-party/lib.js", "exp1", "exp2" ).exp1,
		exp2 = require( "./3rd-party/lib.js" ).exp2;

console.log( "exp1", exp1 );
console.log( "exp2", exp2 );