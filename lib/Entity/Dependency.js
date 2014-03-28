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
* @param {string} id
* @param {number[]} range
* @param {string|string[]} exports
* @param {string|string[]} require
* @param {string} globalProperty
* @returns {module:DependencyEntity}
*/
module.exports = function( id, range, exports, require ) {
	"use strict";
	/**
	 * @type {pbject}
	 * @property {string} id
	 * @property {string} filename
	 * @property {number[]} range
	 * @property {string|string[]} exports
	 * @property {string|string[]} require
	 * @property {string} globalProperty
	 */
	return {
		id: id,
		filename: id,
		range: range,
		exports: exports || [],
		require: require || [],
		globalProperty: null
	};
};
