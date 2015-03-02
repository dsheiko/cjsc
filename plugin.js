
var through = require("through2");
var stream = require("fs").createReadStream( '/tmp/stream.js');

//https://github.com/substack/node-browserify
//http://codewinds.com/blog/2013-08-19-nodejs-writable-streams.html#creating_writable_memory_stream
//http://nodejs.org/api/stream.html#stream_readable_pipe_destination_options
// http://nodejs.org/api/stream.html#stream_class_stream_transform_1
stream.pipe(piping);

//
//// Trying our stream out
//var wstream = new WMStrm('foo');
//
////wstream.write(through2.obj(function (chunk, enc, callback) {
////    this.push(chunk);
////    callback();
//// }));
//  wstream.write(
//    through2.obj(function (buf, enc, next) {
//      next();
//  }, function (next) {
//      next();
//  }));
//
//wstream.on('finish', function () {
//  console.log('finished writing');
//  console.log('value is:', memStore.foo.toString());
//});
//
//wstream.write('hello ');
//wstream.write('world');
//wstream.end();

//
////var extend = require("xtend");
//var argv = require( "argv" );
//  argv.option([
//    {
//      name: "help",
//      short: "h",
//      type: "boolean"
//    },
//    {
//      name: "minify",
//      short: "M",
//      type: "boolean"
//    },
//    {
//      name: "config",
//      short: "C",
//      type: "string"
//    },
//    {
//      name: "transform",
//      short: "t",
//      type: "string"
//    },
//    {
//      name: "source-map",
//      type: "string"
//    },
//    {
//      name: "source-map-url",
//      type: "string"
//    },
//    {
//      name: "source-map-root",
//      type: "string"
//    }
//]);
//
//cli = argv.run(process.argv.slice(2));
//var options = {
//  banner: "",
//  "source-map": "",
//  "source-map-url": "",
//  "source-map-root": "",
//  config: ""
//};
//console.log( extend(options, cli.options) );
//
//
////
//////var through = require("through2");
////
/////*  export a Browserify plugin  */
var piping = function (file, opts) {
    /*  sanity check configuration  */
    if (!opts.replace)
        throw new Error("no configuration entry \"replace\" found");
    if (!(typeof opts.replace === "object" && opts.replace instanceof Array))
        opts.replace = [ opts.replace ];
    for (var i = 0; i < opts.replace.length; i++) {
        if (typeof opts.replace[i] === "string")
            opts.replace[i] = JSON.parse(opts.replace[i])
        else if (typeof opts.replace[i] !== "object")
            throw new Error("configuration entry \"replace[" + i + "]\" neither JSON stringified object nor object");
        if (typeof opts.replace[i].from === "undefined")
            throw new Error("configuration entry \"replace[" + i + "].from\" not defined");
        if (!(typeof opts.replace[i].from === "object" && opts.replace[i].from instanceof RegExp))
            opts.replace[i].from = new RegExp(opts.replace[i].from);
        if (typeof opts.replace[i].to === "undefined")
            throw new Error("configuration entry \"replace[" + i + "].to\" not defined");
        if (!(typeof opts.replace[i].to === "string"))
            opts.replace[i].to = String(opts.replace[i].to);
    }

    /*  provide stream  */
    var code = "";
    return through.obj(function (buf, enc, next) {
        /*  accumulate the code chunks  */
        code += buf.toString("utf8");
        next();
    }, function (next) {
        /*  transform the code  */
        for (var i = 0; i < opts.replace.length; i++)
            code = code.replace(opts.replace[i].from, opts.replace[i].to)
        this.push(new Buffer(code))
        next();
    });
};