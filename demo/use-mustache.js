
var mustache = require( "./mustache/mustache" ),
		tpl = require( "./mustache/example.tpl" ),
		view = {
			title: "Joe",
			calc: function () {
				return 2 + 4;
			}
		};

console.log( mustache.render( tpl, view ) );