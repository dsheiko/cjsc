/*
	* @package cjsc
	* @author sheiko
	* @license MIT
	* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
	* @jscs standard:Jquery
	*/

/**
	* @typedef ImportToken
	* @type {object}
	* @property {string} path - relative path of the file to be imported.
	* @property {number[]} range - position of the call in the code.
	*/

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
/**
	* A module representing Parser
	* @module Parser
	* @param {function( string )} require
	*/
define(function( require ) {
	"use strict";
	/**
	* Parser
	* @constructor
	* @alias module:Parser
	*/
	var Parser = function() {
		var esprima = require( "esprima" );
		return {

			/**
			* Get Esprima syntax tree
			* @param {string} srcCode
			* @returns {Object}
			*/
			getSyntaxTree: function( srcCode ) {
				var syntaxTree;
				syntaxTree = esprima.parse( srcCode, {
					comment: false,
					range: true,
					tokens: false,
					loc: false
				});
				return syntaxTree;
			},


			/**
			*
			* @callback syntaxTreeIteratorCb
			* @param {Object} node
			* @returns {boolean}
			*/
			findDependencyIds: function( node ) {

			}
		};

	};
	return Parser;
});