
var mustache = require( "./mustache" ),
		tpl = require( "./example.tpl" ),
		view = {
			title: "Joe",
			calc: function () {
				return 2 + 4;
			}
		};

window.log.push( mustache.render( tpl, view ).replace( /[\n\r]/gm, ";" ) );