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
        var cfg = global.JSON.parse( opts.replace[ 0 ] );
        //  transform the code
        code = code.replace( cfg.from, cfg.to );
        this.push( new Buffer( code ) );
        next();
    });
};
