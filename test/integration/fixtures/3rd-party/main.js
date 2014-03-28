
var exp1 = require( "./vendors/lib.js", "exp1", "exp2" ).exp1,
		exp2 = require( "./vendors/lib.js" ).exp2;

window.log.push( "exp1:" + exp1.title );
window.log.push( "exp2:" + exp2.title );
