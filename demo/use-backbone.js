
var _ = require( "./external/underscore.js" ),
		Backbone = require( "./external/backbone.js" ),
		object = {};

_.extend( object, Backbone.Events );

object.on( "alert", function( msg ) {
  console.log( "Triggered " + msg );
});

object.trigger( "alert", "an event" );