/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
*/

	/**
	* @module Parser
	* @constructor
	* @alias module:Parser
	* @param {function} DependencyEntity - DependencyEntity constructor
	*/
	module.exports = function( DependencyEntity ) {
		"use strict";
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

						ids.push( new DependencyEntity( node[ "arguments" ][ 0 ].value, node.range ) );
					}
				});
				return ids;
			},
			/**
			 * Find out of the module associated with a given syntax tree uses __dirname, __filename globals
			 * and if it uses `requires` shortcut
			 * @access public
			 * @param {Object} syntaxTree
			 */
			getRequirements: function( syntaxTree ) {
				/**
				 * @type {Object}
				 */
				var requirements = {
					__dirname: false,
					__filename: false,
					shortcut: false
				};
				/**
				* @callback sniffSyntaxTree
				* @param {Object} node
				*/
				this.traverseSyntaxTree( syntaxTree, function( node ){
					if ( node.type === "Identifier" && node.name === "__dirname" ) {
						requirements.__dirname = true;
					}
					if ( node.type === "Identifier" && node.name === "__filename" ) {
						requirements.__filename = true;
					}
					// exports.prop = "dep";
					if ( node.type === "MemberExpression" &&
						!node.computed &&
						node.object && node.object.type &&
						node.object.type === "Identifier" && node.object.name === "exports" ) {
						requirements.shortcut = true;
					}
					// exports = "dep";
					if ( node.type === "AssignmentExpression" &&
						node.left && node.left.type &&
						node.left.type === "Identifier" && node.left.name === "exports" ) {
						requirements.shortcut = true;
					}
				});
				return requirements;
			}
		};

	};
