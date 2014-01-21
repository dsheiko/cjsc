/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
*/

	"use strict";
	/**
	* @module Parser
	* @constructor
	* @alias module:Parser
	* @param {function} DependencyEntity - DependencyEntity constructor
	*/
	var Parser = function( DependencyEntity ) {
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
			* @param {Object} syntaxTree
			*/
			getDependecies: function( syntaxTree ) {
				/**
				 *
				 * @type {dependencyEntiry[]}
				 */
				var ids = [];
			/**
				* @callback sniffSyntaxTree
				* @param {Object} node
				*/
				this.traverseSyntaxTree( syntaxTree, function( node ){
					if ( node.type === "CallExpression" &&
							node.callee && node.callee.type &&
							node.callee.type === "Identifier" && node.callee.name === "require" ) {

						ids.push( new DependencyEntity( node.arguments[ 0 ].value, node.range ) );
					}
				});
				return ids;
			}
		};

	};

module.exports = Parser;