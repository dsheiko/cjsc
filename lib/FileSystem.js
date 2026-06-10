"use strict";
/*
* @author sheiko
* @license MIT
*/

var fs = require( "fs" ),
    npath = require( "path" );

/**
 * @constructor
 * @param {Object} cli
 */
module.exports = function( cli ) {
  var srcDirname = npath.dirname( cli.srcPath ),
      cwd = process.cwd(),
      sourceMapRoot = "",
      srcRelPath = npath.resolve( srcDirname ).substr( cwd.length ).replace( /^\//, "" );

  return {
    /**
     * @returns {Object}
     */
    getProjectInfo: function() {
      var project, plain;
      try {
        plain = fs.readFileSync( npath.join( __dirname, "..", "package.json" ), "utf-8" );
        project = JSON.parse( plain );
      } catch ( e ) {
        throw new ReferenceError( "Cannot read package.json\n" );
      }
      return project;
    },

    /**
     * @param {string} relPath
     * @returns {string}
     */
    resolvePath: function( relPath ) {
      var path = npath.resolve( relPath ),
          opath = path;
      if ( !fs.existsSync( path ) || !fs.statSync( path ).isFile() ) {
        path = npath.resolve( relPath + ".js" );
        if ( !fs.existsSync( path ) || !fs.statSync( path ).isFile() ) {
          path = npath.resolve( relPath + ".es6" );
          if ( !fs.existsSync( path ) || !fs.statSync( path ).isFile() ) {
            throw new ReferenceError( "Couldn't resolve dependency `" + opath + "` specified in the configuration. " +
              "The path must be relative to the project directory (where the compiler is running from) " );
          }
        }
      }
      return path;
    },

    /**
     * @param {string} filename
     * @returns {string}
     */
    getDirname: function( filename ) {
      return npath.dirname( filename );
    },

    /**
     * @param {string} pathArg
     * @returns {string|false}
     */
    fileExists: function( pathArg ) {
      var path = pathArg;
      if ( typeof pathArg !== "string" ) {
        throw new TypeError( "file path must be a string. " + typeof pathArg + " found" );
      }
      if ( !fs.existsSync( pathArg ) || !fs.statSync( pathArg ).isFile() ) {
        path = pathArg + ".js";
        if ( !fs.existsSync( pathArg ) || !fs.statSync( pathArg ).isFile() ) {
          path = pathArg + ".es6";
          if ( !fs.existsSync( pathArg ) || !fs.statSync( pathArg ).isFile() ) {
            return false;
          }
        }
      }
      return path;
    },

    /**
     * @param {string} pathArg
     * @param {Function} [done]
     * @returns {string}
     */
    readJs: function( pathArg, done ) {
      var path = this.fileExists( pathArg );
      if ( !path ) {
        throw new ReferenceError( pathArg + " doesn't exist\n" );
      }
      if ( done ) {
        return this.readStream( path, done );
      }
      return fs.readFileSync( path, "utf-8" );
    },

    /**
     * @param {string} pathArg
     * @param {Function} done
     */
    readStream: function( pathArg, done ) {
      var out = "",
          stream;

      stream = fs.createReadStream( pathArg, {
        flags: "r",
        encoding: "utf-8",
        fd: null,
        highWaterMark: 64 * 1024
      });

      cli.options.transform && cli.options.transform.forEach( function( cfg ) {
        var plugin;
        try {
          plugin = typeof cfg.target === "string" ? require( cfg.target ) : cfg.target;
        } catch ( e ) {
          throw new Error( "Cannot find `" + cfg.target + "` module. Try npm install " + cfg.target );
        }
        stream = stream.pipe( plugin( pathArg, cfg.options || {} ) );
      });

      stream
        .on( "data", function( data ) {
          out += data;
        })
        .on( "end", function() {
          done( out );
        });
    },

    /**
     * @param {string} file
     * @param {string} data
     */
    writeJs: function( file, data ) {
      fs.writeFileSync( file, data, "utf-8" );
    },

    /**
     * Resolve a path relative to the caller's directory.
     * '/foo/bar/filename.js', './baz' -> relative/path/to/baz
     *
     * @param {string} relPath
     * @param {string} [calleeFilename]
     * @returns {string}
     */
    resolveFilename: function( relPath, calleeFilename ) {
      var dirname = calleeFilename ? npath.dirname( calleeFilename ) : ".",
          resolvedName = npath.resolve( dirname, relPath );

      if ( !fs.existsSync( resolvedName ) || !fs.statSync( resolvedName ).isFile() ) {
        resolvedName = npath.resolve( dirname, relPath + ".js" );
        if ( !fs.existsSync( resolvedName ) || !fs.statSync( resolvedName ).isFile() ) {
          resolvedName = npath.resolve( dirname, relPath + ".es6" );
          if ( !fs.existsSync( resolvedName ) || !fs.statSync( resolvedName ).isFile() ) {
            throw new ReferenceError( "Couldn't resolve dependency `" + relPath + "` in `" +
              ( calleeFilename || dirname ) + "`" );
          }
        }
      }
      resolvedName = npath.relative( cwd, resolvedName );
      return resolvedName;
    },

    /**
     * @param {string} fileName
     * @returns {string}
     */
    getFixedFileName: function( fileName ) {
      return fileName.replace( /\\/g, "/" );
    },

    /**
     * @param {string} root
     * @param {string} srcMapFile
     */
    setSourceMapRoot: function( root, srcMapFile ) {
      var rootResolved = npath.join( npath.dirname( srcMapFile ), root );
      if ( !fs.existsSync( rootResolved ) ) {
        throw new Error( "Source map root `" + rootResolved + "` doesn't exist" );
      }
      sourceMapRoot = root;
    },

    /**
     * @param {string} filename
     * @returns {string}
     */
    resolveRelativeScrPath: function( filename ) {
      return sourceMapRoot ? npath.join( sourceMapRoot, filename.substr( srcRelPath.length ) ) : filename;
    },

    /**
     * @param {string} path
     * @returns {string}
     */
    getRelPath: function( path ) {
      return npath.resolve( path ).substr( npath.resolve( srcDirname ).length ).replace( /^\//, "" );
    }
  };
};
