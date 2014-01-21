/**
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
*/

/**
* @module DependencyEntity
* @constructor {Object} DependencyEntity
* @alias module:DependencyEntity
*/
module.exports = function( id, range ) {
	return {
		/** @type {string} */
		id: id,
		/** @type {string} */
		filename: id,
		/** @type {number[]} */
		range: range,
		/**
		 * Resolve filename
		 * calls cli.resolveFilename( id, calleeFileName );
		 * @param {function} resolver
		 * @param {Object} context
		 * @parem {string} calleeFileName
		 */
		resolve: function( resolver, context, calleeFileName ) {
			this.filename = resolver.apply( context, [ this.id, calleeFileName ] );
		}
	};
};
