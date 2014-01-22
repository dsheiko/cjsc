// UMD boilerplate according to https://github.com/umdjs/umd
if ( typeof module === "object" && typeof define !== "function" ) {
	/**
	* Override AMD `define` function for RequireJS
	* @param {function( function, Object, Object )} factory
	*/
	var define = function ( factory ) {
		module.exports = factory( require, exports, module );
	};
}

define(function( require, exports, module ) {
	console.log( "%s is running...", module.id );
	console.log( "%s imports %s", module.id, require( "module2.js" ).id );
	return { id: module.id };
});