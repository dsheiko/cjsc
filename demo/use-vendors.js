
var exp1 = require( "./vendors/lib.js", "exp1", "exp2" ).exp1,
		exp2 = require( "./vendors/lib.js" ).exp2;

console.log( "exp1", exp1 );
console.log( "exp2", exp2 );