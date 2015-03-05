/**
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
*/
/**
* @module DependencyConfig
* @constructor {Object} DependencyConfig
* @alias module:DependencyConfig
* @param {object} [depConfig]
* @returns {module:DependencyConfig}
*/
module.exports = function( depConfig ) {
	"use strict";
	// Contract
	if ( depConfig.path && typeof depConfig.path !== "string" ) {
		throw new TypeError( "Configuration `path` property must be a string. " +
			"For example: { path: \"./lib/jquery.js\" } " );
	}
	if ( depConfig.globalProperty && typeof depConfig.globalProperty !== "string" ) {
		throw new TypeError( "Configuration `globalProperty` property must be a string. " +
			"For example: { globalProperty: \"jQuery\" }" );
	}
	if ( depConfig.exports && ( typeof depConfig.exports !== "string" && !Array.isArray( depConfig.exports ) ) ) {
		throw new TypeError( "Configuration `exports` property must be either a string or an array of strings. " +
			"For example: { exports: [ \"$\" ] } " );
	}
	if ( depConfig.require && ( typeof depConfig.require !== "string" && !Array.isArray( depConfig.require ) ) ) {
		throw new TypeError( "Configuration `exports` property must be either a string or an array of strings. " +
			"For example: { exports: [ \"$\" ] } " );
	}

  if ( depConfig.exports && typeof depConfig.exports === "string" ) {
    depConfig.exports = [ depConfig.exports ];
  }
  if ( depConfig.require && typeof depConfig.require === "string" ) {
    depConfig.require = [ depConfig.require ];
  }
	/**
	 * @type {pbject}
	 * @property {string} path
	 * @property {string} globalProperty
	 * @property {string|string[]} exports
	 * @property {string|string[]} require
	 */
	return {
		path: depConfig.path || null,
		globalProperty: depConfig.globalProperty || null,
		exports: depConfig.exports || [],
		require: depConfig.require || []
	};
};
