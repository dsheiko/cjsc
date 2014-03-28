
var _ = require( "./backbone/underscore.js" ),
		Backbone = require( "./backbone/backbone.js" ),
		object = {};

_.extend( object, Backbone.Events );

object.on( "alert", function( msg ) {
  console.log( "Triggered " + msg );
});

object.trigger( "alert", "an event" );