var handlebars = require( "./handlebars", "Handlebars" ).Handlebars,
		tpl = require( "./example.hbs" ),
		view = {
			title: "My New Post",
			body: "This is my first post!"
		};
window.log.push( handlebars.compile( tpl )( view ).replace( /[\n\r]/gm, ";" ) );