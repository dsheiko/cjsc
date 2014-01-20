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
			* Esprima syntax tree traverser
			* @access public
			* @param {Object} node
			* @param {sniffSyntaxTree} fn
			* @param {Object} parentNode
			*/
			traverseSyntaxTree: function( node, fn, parentNode ) {
				var that = this,
					propName,
					contents,
					/**
					* @callback traverseEvery
					* @param {Object} member
					*/
					traverseEvery = function( member ) {
						that.traverseSyntaxTree( member, this.fn, this.node );
					};

				if ( node && node.hasOwnProperty( "type" ) ) {
					fn( node, parentNode );
				}

				for ( propName in node ) {
					if ( propName !== "parent" && node.hasOwnProperty( propName ) &&
						propName !== "tokens" && propName !== "comments" ) {
						contents = node[ propName ];
						if ( contents && typeof contents === "object" ) {
							if ( Array.isArray( contents ) ) {
								contents.forEach( traverseEvery, { fn: fn, node: node });
							} else {
								that.traverseSyntaxTree( contents, fn, node );
							}
						}
					}
				}
			},

			/**
			*
			* @access public
			* @param {Object} node
			*/
			getDependecies: function( syntaxTree ) {
				/**
				 *
				 * @type {{ id: string, range: number[]}[]}
				 */
				var ids = [];
			/**
				* @callback sniffSyntaxTree
				* @param {Object} node
				* @param {Object} [pNode={ type: null }]
				*/
				this.traverseSyntaxTree( syntaxTree, function( node ){
					if ( node.type === "CallExpression" &&
							node.callee && node.callee.type &&
							node.callee.type === "Identifier" && node.callee.name === "require" ) {

						ids.push({
							id: node.arguments[ 0 ].value,
							range: node.arguments[ 0 ].range
						});
					}
				});
			}
		};

	};
	return Parser;
});