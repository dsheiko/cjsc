/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

var /**
		 * @type {module:lib/DependencyConfig}  DependencyConfig constructor
		 */
		DependencyConfig = require( "./Entity/DependencyConfig" );

module.exports = function( fileName, fSys ){
  var /** @type {Object} */
      config = {},
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

    if ( fileName ) {
			try {
				config = JSON.parse( fSys.readJs( fileName ) );
			} catch( e ) {
				throw new SyntaxError( "`" + fileName + "` appears to be invalid JSON" );
			}
			// Validate the contract
			validateRequireConfig( config );
		}
  return {
    setModulePayload: function( fileName, modulePayload ) {
      if ( config && config[ fileName ] ) {
        modulePayload.globalProperty = config[ fileName ].globalProperty || modulePayload.globalProperty;
        modulePayload.exports = config[ fileName ].exports || modulePayload.exports;
        modulePayload.require = config[ fileName ].require || modulePayload.require;
      }
    },
    exists: function( fileName ) {
      return config && config[ fileName ];
    },
    get: function( fileName ) {
      return config[ fileName ];
    }
  };
};