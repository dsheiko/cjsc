CommonJS Compiler
==============

[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

> WARNING - THIS PROJECT IS NO LONGER MAINTAINED!!!

[![NPM](https://nodei.co/npm/cjsc.png)](https://nodei.co/npm/cjsc/)

[![Build Status](https://travis-ci.org/dsheiko/cjsc.png)](https://travis-ci.org/dsheiko/cjsc)
[![Join the chat at https://gitter.im/dsheiko/cjsc](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dsheiko/cjsc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

`cjsc` is a JavaScript transpiler that makes your CommonJS modules suitable for in-browser use.
While every AMD-module results in a separate HTTP request and therefore [badly affects page
response time](https://developer.yahoo.com/performance/rules.html),
`cjsc`, instead, combines all the acting modules in a single file (optionally compressed).

Comparing to the alternatives [Browserify](http://browserify.org/) and [Webpack](https://github.com/webpack/webpack),
`cjsc` is much lighter and easier to configure. It's not a multipurpose tool. While
Browserify attempts to bring node.js to the browser and Webpack to bundle as many formats as possible, `cjsc` is
fully designated for a single task - to make CommonJS modules available in-browser. And it does the task pretty well.


## Features

* Does not bring into your production code any additional library
* Works fine with UMD modules (including jQuery, Backbone, Underscore and others)
* Allows exporting globals of 3rd party libraries without intervention in their code
* Supports source maps http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
* Supports JavaScript templates ( Mustache, Handlebars, Underscore and others )
* Produces a string out of (multiline) non-JS external text file
* Provides transformation plugin API
* Supports [Browserify transformers](https://www.npmjs.com/browse/keyword/browserify-plugin)
* Supports [Babel.js](https://babeljs.io/) transformation


![How cjsc works](https://github.com/dsheiko/cjsc/raw/master/doc/cjsc-process.jpg)

# Contents
* [How to install](#a-install)
* [Getting Started](#a-work)
* [How to use in the command line](#a-use)
* [File modules](#a-file-modules)
* [Caching](#a-caching)
* [Setting up Grunt task](#a-grunt)
* [How to configure dependency](#a-config)
* [How to make module of a globally exposed variable](#a-config-a)
* [How to make modules of jQuery and its plugins](#a-config-b)
* [How to make modules of 3rd party libraries](#a-vendors)
* [How to use Mustache templates](#a-mustache)
* [How to use Handlebars templates](#a-handlebars)
* [How to load the compiled files asynchronously](#a-async)
* [Bonus tricks](#a-bonus)
* [API](#a-api)
* [Plugin example](#a-pluginexample)
* [How to compile ES6/2015 into ES5](#a-es6)



## <a name="a-install"></a>How to install

### Install nodejs/npm
`cjsc` utilizes nodejs and its package manager (NPM). If don't have these tools yet installed, you can find details on
https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager

### Install `cjsc`

Locally:
```bash
npm i cjsc --save-dev
```

or globally:
```bash
sudo npm i cjsc -g
```
Note: in this case npm creates a symlink `/usr/bin/cjsc`

## <a name="a-work"></a>Getting Started

Let's define a few CommonJS modules (http://wiki.commonjs.org/wiki/Modules/1.1.1):

`./main.js`
```javascript
console.log( "main.js running..." );
console.log( "Imported name in main.js is `%s`", require( "./lib/dep1" ).name );
console.log( "Getting imported object from the cache:" );
console.log( " imported name in main.js is still `%s`", require( "./lib/dep1" ).name );
```

`./lib/dep1.js`
```javascript
console.log( "dep1.js running..." );
console.log( " it has __diname = `%s`", __dirname );
console.log( " it has __filename = `%s`", __filename );
console.log( "Imported name in dep1.js is `%s`", require( "./dep2" ).name );
exports.name = "dep1";
```

`./lib/dep2.js`
```javascript
console.log( "dep2.js running..." );
module.exports.name = "dep2";
```

Now we can compile the modules:
```bash
cjsc main.js -o script.js
```

As we execute script.js we get the following output:
```
main.js running...
dep1.js running...
 it has __diname = `.../demo/lib`
 it has __filename = `.../demo/lib/dep1.js`
dep2.js running...
Imported name in dep1.js is `dep2`
Imported name in main.js is `dep1`
Getting imported object from the cache:
 imported name in main.js is still `dep1`
```







## <a name="a-use"></a>Using CommonJS Compiler in the command line

```
 Usage: cjsc <src-path> <dest-path>

    <src-path> - source filename (e.g. main.js)

    --output, -o
        destination filename for compiled code
        example: <dest-path>, -o=<dest-path>

    --minify, -M
        minify the output file

    --config, -C
        specify a configuration JSON file
        example: --config=<file>

    --transform, -t
        use a transform module on top-level files.
        example: --transform=[MODULE --opt]

    --plugin, -p
        register MODULE as a plugin
        example: --plugin=MODULE

    --source-map
        specify an output file where to generate source map. Use "*" automatic naming
        example: --source-map=<file/pattern>

    --source-map-url
        the path to the source map to be added in.
        example: --source-map-url=<url>

    --source-map-root
        the path to the original source to be included in the source map.
        example: --source-map-root=<path>

    --banner
        preserve copyright comments in the output.

    --debug
        debug mode.

    --help, -h
        displays this help screen


Passing arguments to transforms:

  For -t you may use subarg syntax to pass options to the
  transforms or plugin function as the second parameter. For example:

    -t [ foo --x 3 --beep '{ a: 1 }' ]

  will call the `foo` transform for each applicable file by calling:

    foo( file, { x: 3, beep: '{ a: 1 }' } )
```

Compile `main-module.js` into `build.js`:
```bash
./cjsc main-module.js -o build.js
```
or
```bash
node cjsc.js main-module.js -o build.js
```

Compile `main-module.js` into `build.js` and generate source map
```bash
./cjsc main-module.js -o build.js  --source-map=build/build.js.map --source-map-url=http://localhost/
```
or the following options for automatic naming
```bash
./cjsc main-module.js -o build.js  --source-map=*.map
```
or this way to explicitly specify the path to sources relative to the source map
```bash
./cjsc main-module.js -o build.js  --source-map=build/*.map --source-map-root=../src
```

Whereas:
* `--source-map` is a source map file path relative to the project directory (the directory where cjsc is running)
* `--source-map-url` by default is "." and means the same path as source map file
* `--source-map-root` is sources path relative to the source map file. For instance: sources are in `<project>/src`, build is in `<project>/build`. So specify `--source-map-root=../src` to let the browser know that it must look for mapped source file in `../src/**/file.js` relative to the source map path.

Now breakpoints and console messages mapped to the original sources
![Source mapping example](https://raw.github.com//dsheiko/cjsc/master/demo/img/console-ex.jpg "Source mapping example")


Compile `main-module.js` into `build.js` and minify `build.js`
```bash
./cjsc main-module.js -o build.js -M
```

With a banner
```bash
./cjsc main-module.js -o build.js -M --banner="/*! pkg v.0.0.1 */"
```



## <a name="a-file-modules"></a>File Modules


## The `module` object
Every module has exposed `module` variable that references to an object representing the module.
Like in [NodeJS](http://nodejs.org/api/modules.html) the object has following structure:

* module.id {string} - The identifier for the module.
* module.filename {string} - The fully resolved filename to the module.
* module.loaded {boolean} - Whether or not the module is done loading.
* module.parent {Object} - The module that required this one.
* module.children {Object[]} - The module objects required by this one

## <a name="a-caching"></a>Caching

Caching goes the same as in nodejs. Modules are cached after the first time they are loaded.
So every call to `require('foo')` returns exactly the same object, if it refers to the same file.

Multiple calls to `require('foo')` don't execute the module code multiple times.


## <a name="a-grunt"></a>Setting up [Grunt](http://gruntjs.com/) task

*Gruntfile.js*
```javascript
grunt.loadNpmTasks('grunt-cjsc');
grunt.initConfig({
     cjsc: {
      development: {
				options: {
					minify: true
				},
        files: {
          "<path>/compiled.js" : "<path>/source.js"
        }
      }
    }
  });
```
*package.json*
```javascript
"devDependencies": {
    //..
    "grunt-cjsc": ">=1.0.0"
  }
```

Please find details at https://github.com/dsheiko/grunt-cjsc



## <a name="a-config"></a>How to configure dependency

You can configure your dependencies in a JSON file. E.g. `config.json`:
```javascript
{
	"<dependency-name>": {
		"path": "<dependency-path>",
		"globalProperty": "<global-property>",
		exports: [ "<variable>", "<variable>" ],
		require: [ "<dependency-name>", "<dependency-name>" ]
	}
}
```
or
```javascript
{
	"<dependency-name>": {
		"path": "<dependency-path>",
		"globalProperty": "<global-property>",
		exports: "<variable>",
		require: "<dependency-name>"
	}
}
```
To enable the configuration use `--config` option:
```
node cjsc main.js build.js --config=config.json
```

 Passing plugin configurations:

```javascript
{
  "ver": 1,
  "modules": {
    "<dependency-name>": {},
    "<dependency-name>": {}
  },
  "plugins": [
    {
      "plugin": "<pkg-name>",
      "targets":  {
        "<target>": [{
          /* options object */
        }]
      }
    }
  ]
}
```

## <a name="a-config-a"></a>How to make module of a globally exposed variable
`config.json`:
```javascript
{
	"jQuery": {
		"globalProperty": "jQuery"
	}
}
```
`main.json`:
```javascript
var $ = require( "jQuery" );
// $ - is a reference to globally exposed jQuery instance (assuming window.jQuery si defined outside this module)
console.log( $( window ) );
```
Compilation:
```
node cjsc main.js build.js --config=config.json
```



## <a name="a-config-b"></a>How to make modules of jQuery and its plugins
`config.json`:
```javascript
{
	"jQuery": {
		"path": "./vendors/jquery-2.1.0.min.js"
	},
	"placeholder": {
		"path": "./vendors/jquery.placeholder.js",
		"require": "jQuery",
		"exports": "jQuery"
	}
}
```
`main.json`:
```javascript
// Obtain jQuery as UMD-module
var $ = require( "jQuery" );
// Attach plugin to jQuery
require( "placeholder" );
console.log( $.fn.placeholder );
```
Compilation:
```
node cjsc main.js build.js --config=config.json
```


## <a name="a-vendors"></a>How to make modules of 3rd party libraries

Options #1:
```javascript
// Load 3rd-party library and export the globals it exposes ("exp1" and "exp2")
var exp1 = require( "./vendors/lib.js", "exp1", "exp2" ).exp1,
// Take the second exported object from the module cache
		exp2 = require( "./vendors/lib.js" ).exp2;

console.log( "exp1", exp1 );
console.log( "exp2", exp2 );
```

Options #2:

`config.json`:
```javascript
{
	"lib": {
		"path": "./vendors/lib.js",
		"exports": [ "exp1", "exp2" ]
	}
}
```
`main.json`:
```javascript
var lib = require( "lib" );
console.log( lib.exp1, lib.exp2 );
```
Compilation:
```
node cjsc main.js -o build.js --config=config.json
```

If 3rd party code exposes the only object, it can be done like that:

`config.json`:
```javascript
{
	"lib": {
		"path": "./vendors/lib.js",
		"exports": "exp1"
	}
}
```
Note: The `"path"` must be relative to the project directory (where the compiler is running from)

`main.json`:
```javascript
var lib = require( "lib" );
// Exp1
console.log( lib );
```




## <a name="a-mustache"></a>How to use Mustache templates
Template file: ./mustache/example.tpl
```
{{title}} spends {{calc}}
```
Module that uses the template
```javascript
var mustache = require( "./mustache/mustache" ),
		tpl = require( "./mustache/example.tpl" ),
		view = {
			title: "Joe",
			calc: function () {
				return 2 + 4;
			}
		};

console.log( mustache.render( tpl, view ) );
```


## <a name="a-handlebars"></a>How to use Handlebars templates
Template file: ./handlebarsjs/example.hbs
```
<div class="entry">
  <h1>{{title}}</h1>
  <div class="body">
    {{body}}
  </div>
</div>
```
Module that uses the template
```javascript
var handlebars = require( "./handlebarsjs/handlebars", "Handlebars" ).Handlebars,
		tpl = require( "./handlebarsjs/example.hbs" ),
		view = {
			title: "My New Post",
			body: "This is my first post!"
		};

console.log( handlebars.compile( tpl )( view ) );
```

## Supplied demos

```
# Generic flow
node cjsc.js -o /tmp/build.js demo/use-main-flow.js
node /tmp/build.js

# Access 3rd-party non-module in a module
node cjsc.js -o /tmp/build.js demo/use-3rd-party.js
node /tmp/build.js

# Non-module to compiled CommonJS
node cjsc.js -o /tmp/build.js demo/use-nonmodule.js
node /tmp/build.js

# UMD to compiled CommonJS
node cjsc.js -o /tmp/build.js demo/use-umd.js
node /tmp/build.js

# Backbone as a module
node cjsc.js -o /tmp/build.js demo/use-backbone.js
node /tmp/build.js

# Templating with Mustache
node cjsc.js -o /tmp/build.js demo/use-mustache.js
node /tmp/build.js

# Templating with Handlebars.js
node cjsc.js -o /tmp/build.js  demo/use-handlebars.js
node /tmp/build.js

# Source map usage demo
node cjsc.js -o demo/source-map/build.js demo/source-map/src/use-main-flow.js --source-map=demo/source-map/*.map --source-map-root=./src

# Config usage demo
node cjsc.js -o /tmp/build.js demo/use-config.js --config=./demo/config/config.json

# Browserify-plugin usage demo
npm install -g browserify-replace
node cjsc.js -o /tmp/build.js demo/use-browserify-replace.js -t [ browserify-replace \
                  --replace '{ "from": "\\$foo", "to": 42 }' \
                  --replace '{ "from": "\\$bar", "to": "quux" }' ]

# ES6 via Babel.js usage demo
node cjsc.js -o /tmp/build.js  demo/use-es6.es6 -t [ babelify --presets [ es2015 --sourceMapRelative ] ]
node /tmp/build.js
```

## <a name="a-async"></a>How to load the compiled files asynchronously
Loading dozens of atomic modules asynchronously usually slower then loading one compiled file. This is an advantage of Common JS compiler
 over AMD. However if you go with a huge compiled file, it would be efficient to split it into a few parts for async loading.
It is a matter of balance: too many HTTP requires is bad for performance as well as too few. Here how I deal with it.

I inline into the page body tiny async loader [Micro RequireJS](https://github.com/dsheiko/micro-requirejs) (1.5K)
and use it to load external libraries and compiled assets asynchronously:

```php
<script type="text/javascript">
<?php include PATH_ROOT . "node_modules/micro-requirejs/rjs.min.js"; ?>

rjs.define( "/vendors/jquery/jquery-1.10.2.min.js", "jquery" );
rjs.define( "/vendors/picturefill/picturefill.min.js", "picturefill" );
rjs.define( "/build/js/app.js", "app" );
rjs.define( "/build/js/sub-app.js", "subapp" );
// Backbone requires jQuery during initialization
rjs.require([ "jquery" ], function(){
  rjs.define( "/vendors/exoskeleton/exoskeleton.min.js", "backbone" );
});

</script>
```

Then I specify in the source module what dependencies must be resolved before running the code depended on them:
```javascript
global.rjs.require([ "jquery", "backbone" ], function(){
  var $ = require( "jquery" ),
      Backbone = require( "backbone" );

  //...
});
```

## <a name="a-bonus"></a>Bonus tricks
While debugging you can refer to the module name as `__modulename`:

```javascript
console.log( __modulename + ": remote call [status=%s]", status );
// >> Lib/Api/Provider: remote call [status=ok]
```


## <a name="a-api"></a>API
```
var cjsc = require( ".././cjsc-module" ),
    args = {
      targets: [ "./demo/use-main-flow.js", "/tmp/build.js" ],
      options: {
        debug: true,
        transform: [{
          target: pkgName,
          options: {
            foo: true
          }
        }]
      }
    },
    config = {
      "foo": {
         "globalProperty": "foo"
       }
    };

cjsc( args, config, function( code ){
  console.log( "All done. Generated code:", code );
});
```
## <a name="a-pluginexample"></a>Plugin example

Plugin example
```
var through = require( "through2" );

/*  export a Browserify plugin  */
module.exports = function ( file, opts ) {
    /*  provide stream  */
    var code = "";
    return through.obj(function (buf, enc, next) {
        //  accumulate the code
        code += buf.toString("utf8");
        next();
    }, function ( next ) {
        // Get parameters for `replace` target
        // if command line has multiple `replace` targets, opts.replace is an array
        var params = global.JSON.parse( opts.replace );
        //  transform the code
        code = code.replace( cfg.from, cfg.to );
        this.push( new Buffer( code ) );
        next();
    });
};
```

Usage:
```
node cjsc.js -o /tmp/build.js app.js -t [ plugin \
                  --replace '{ "from": "\\$foo", "to": 42 }' ]
```

## <a name="a-es6"></a>Compiling to ES6(2015)

```
cjsc.js src/Js/app.js -t [ babelify --presets [ es2015 ] --sourceMapRelative ] -o ./build/app.js
```

## Alternatives
* Browserify - http://browserify.org/
* SystemJS - https://github.com/systemjs/systemjs
* Webpack - https://github.com/webpack/webpack
* Modules-webmake - https://github.com/medikoo/modules-webmake
* Frictionless browser package management - http://jspm.io/ (bundles ES6/AMD/CommonJs modules into a single file for production)

[![Analytics](https://ga-beacon.appspot.com/UA-1150677-13/dsheiko/cjsc)](http://githalytics.com/dsheiko/cjsc)

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/dsheiko/cjsc/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

