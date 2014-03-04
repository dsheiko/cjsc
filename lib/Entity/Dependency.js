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
* @returns {DependencyEntity}
*/
module.exports = function( id, range, exports ) {
	"use strict";
	/**
	 * @type {pbject}
	 * @property {string} id
	 * @property {string} filename
	 * @property {number[]} range
	 * @property {*[]} exports
	 */
	return {
		id: id,
		filename: id,
		range: range,
		exports: exports || []
	};
};
