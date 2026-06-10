"use strict";
/*
* @author sheiko
* @license MIT
*/

var esprima = require( "esprima" );

/**
 * @constructor
 * @param {Function} DependencyEntity
 */
module.exports = function( DependencyEntity ) {
  return {
    /**
     * @param {string} srcCode
     * @param {boolean} needLoc
     * @returns {Object}
     */
    getSyntaxTree: function( srcCode, needLoc ) {
      return esprima.parseScript( srcCode, {
        tolerant: true,
        range: !needLoc,
        loc: !!needLoc
      });
    },

    /**
     * Depth-first AST traversal.
     * @param {Object} node
     * @param {Function} fn
     * @param {Object} parentNode
     */
    traverseSyntaxTree: function( node, fn, parentNode ) {
      var that = this,
          propName,
          contents,
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
     * Extract all require() call dependencies from the syntax tree.
     * @param {Object} syntaxTree
     * @returns {Array}
     */
    getDependecies: function( syntaxTree ) {
      var entities = [];
      this.traverseSyntaxTree( syntaxTree, function( node ) {
        if ( node.type === "CallExpression" &&
            node.callee && node.callee.type &&
            node.callee.type === "Identifier" && node.callee.name === "require" ) {
          entities.push( new DependencyEntity(
            node[ "arguments" ].shift().value,
            node.range,
            node[ "arguments" ].map( function( arg ) {
              return arg.value;
            })
          ));
        }
      });
      return entities;
    },

    /**
     * Find all _require.def() calls in compiled output for source map generation.
     * @param {Object} syntaxTree
     * @returns {Array}
     */
    getCompiledModuleRange: function( syntaxTree ) {
      var entities = [];
      this.traverseSyntaxTree( syntaxTree, function( node ) {
        var loc;
        if ( node.type === "CallExpression" &&
            node.callee && node.callee.type &&
            node.callee.type === "MemberExpression" &&
            node.callee.object.name === "_require" &&
            node.callee.property.name === "def" ) {
          loc = node[ "arguments" ][ 1 ].body.loc;
          entities.push({
            filename: node[ "arguments" ][ 0 ].value,
            range: [ loc.start.line, loc.end.line ]
          });
        }
      });
      return entities;
    },

    /**
     * Detect usage of Node.js globals and exports shortcut in a syntax tree.
     * @param {Object} syntaxTree
     * @returns {Object}
     */
    getRequirements: function( syntaxTree ) {
      var requirements = {
        __dirname: false,
        __filename: false,
        __modulename: false,
        shortcut: false,
        path: null,
        globalProperty: null,
        exports: [],
        require: [],
        type: 0
      };
      this.traverseSyntaxTree( syntaxTree, function( node ) {
        if ( node.type === "Identifier" && node.name === "__dirname" ) {
          requirements.__dirname = true;
        }
        if ( node.type === "Identifier" && node.name === "__filename" ) {
          requirements.__filename = true;
        }
        if ( node.type === "Identifier" && node.name === "__modulename" ) {
          requirements.__modulename = true;
        }
        if ( node.type === "MemberExpression" &&
            !node.computed &&
            node.object && node.object.type &&
            node.object.type === "Identifier" && node.object.name === "exports" ) {
          requirements.shortcut = true;
        }
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
