var through = require("through2");

/*  export a Browserify plugin  */
module.exports = function (file, opts) {
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
            code = code.replace(opts.replace[i].from, opts.replace[i].to);
        this.push(new Buffer(code));
        next();
    });
};
