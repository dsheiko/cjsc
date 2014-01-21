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
module.exports = function( id, range ) {
	"use strict";
	return {
		/** @type {string} */
		id: id,
		/** @type {string} */
		filename: id,
		/** @type {number[]} */
		range: range
	};
};
