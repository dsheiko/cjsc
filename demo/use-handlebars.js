var handlebars = require( "./handlebarsjs/handlebars", "Handlebars" ).Handlebars,
		tpl = require( "./handlebarsjs/example.hbs" ),
		view = {
			title: "My New Post",
			body: "This is my first post!"
		};

console.log( handlebars.compile( tpl )( view ) );