/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

"use strict";

/** @module fs */
var fs = require( "fs" ),
    /** @module path */
    npath = require( "path" ),
    /**
		 * @type {module:DependencyConfig} DependencyConfig constructor
		 */
		DependencyConfig = require( "./Entity/DependencyConfig" ),
    /**
      * @param {Object} config
      */
     validateRequireConfig = function( config ) {
       var prop;
       for ( prop in config ) {
         if ( config.hasOwnProperty( prop ) ) {
           config[ prop ] = new DependencyConfig( config[ prop ] );
         }
       }
     };

/**
 *
 */
module.exports = function( optConfig, fSys ){
    var config = config || {};
    if ( optConfig ) {
			try {
				config = JSON.parse( fSys.readJs( optConfig ) );
			} catch( e ) {
				throw new SyntaxError( "`" + optConfig + "` appears to be invalid JSON" );
			}
			// Validate the contract
			validateRequireConfig( config );
		}
    return config;
};
