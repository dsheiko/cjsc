/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/
    /** @type {module:fs} */
var fs = require( "fs" ),
    /** @type {module:path} */
    npath = require( "path" );

"use strict";
/**
 *
 * @param {string} srcDirname
 */
module.exports = function( cli ){
  var
      srcDirname = npath.dirname( cli.srcPath ),
      /** @type {String} */
      cwd = process.cwd(),
      /**
       * to resolve build path relative to source path
       * @type {string}
       */
      sourceMapRoot = "",
      /**
      * Relative path to sources e.g. for /home/user/src -> src
      * @type {string}
      */
     srcRelPath = npath.resolve( srcDirname ).substr( cwd.length ).replace( /^\//, "" );

  return {
    /**
     * Resolve the path given in config
     * @param {string} relPath
     * @returns {string}
     */
    resolvePath: function( relPath ) {
      var path = npath.resolve( relPath ),
          opath = path;
      if ( !fs.existsSync( path ) || !fs.statSync( path ).isFile() ) {
        path = npath.resolve( relPath + ".js" );
        if ( !fs.existsSync( path ) || !fs.statSync( path ).isFile() ) {
          throw new ReferenceError( "Could't resolve dependency `" + opath + "` specified in the configuration. " +
            "The path must be relative to the project directory (where the compiler is running from) " );
        }
      }
      return path;
    },
    /**
     * Proxy path.dirname
     * @param {string} filename
     * @returns {string}
     */
    getDirname: function( filename ) {
      return npath.dirname( filename );
    },

    /**
     *
     * @param {String} pathArg
     * @returns {Boolean}
     */
    fileExists: function( pathArg ) {
      if ( typeof pathArg !== "string" ) {
        throw new TypeError( "file path must be a string. " + typeof pathArg + " found" );
      }
      if ( !fs.existsSync( pathArg ) || !fs.statSync( pathArg ).isFile() ) {
        pathArg = pathArg + ".js";
        if ( !fs.existsSync( pathArg ) || !fs.statSync( pathArg ).isFile() ) {
          return false;
        }
      }
      return pathArg;
    },
    /**
    *
    * @param {string} pathArg
    * @param {Function} [done]
    * @return {string}
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
    *
    * @param {string} pathArg
    * @param {Function} done
    * @return {string}
    */
    readStream: function( pathArg, done ) {
      var out = "",
          stream;

      stream = fs.createReadStream( pathArg, {
        flags: "r",
        encoding: "utf-8",
        fd: null,
        bufferSize: 64 * 1024
      });

      cli.plugins && cli.plugins.forEach(function( cfg ){
        var plugin;
        try {
          plugin = require( cfg.plugin );
        } catch ( e ) {
          throw Error( "Cannot find `" + cfg.plugin + "` module. Try npm install " + cfg.plugin );
        }
        stream = stream.pipe( plugin( pathArg, cfg.targets || {} ) );
      });

      stream
        .on( "data", function ( data ) {
          out += data;
        })
        .on( "end", function() {
          done( out );
        });
    },
    /**
    *
    * @param {string} file
    * @param {string} data
    */
    writeJs: function( file, data ) {
      fs.writeFileSync( file, data, "utf-8" );
    },
    /**
    * Resolve relative path relative to initial path (where main module located)
    * or relative to callee if any given
    * ('/foo/bar/filename.js', './baz') -> /foo/bar/baz
    * ('/foo/bar', './baz') -> /foo/bar/baz
    * ('/foo/bar', '/tmp/file/') -> /tmp/file/
    * @param {string} relPath
    * @param {string} [calleeFilename]
    * @return {string}
    */
    resolveFilename: function( relPath, calleeFilename ) {
          /** @type {string} */
      var dirname = calleeFilename ? npath.dirname( calleeFilename ) : ".",
          /** @type {string} */
          resolvedName = npath.resolve( dirname, relPath );

      if ( !fs.existsSync( resolvedName ) || !fs.statSync( resolvedName ).isFile() ) {
        resolvedName = npath.resolve( dirname, relPath + ".js" );
        if ( !fs.existsSync( resolvedName ) || !fs.statSync( resolvedName ).isFile() ) {
          throw new ReferenceError( "Could't resolve dependency `" + relPath + "` in `" +
            ( calleeFilename || dirname ) + "`" );
        }
      }
      // Cut the absolute path
      resolvedName = npath.relative( cwd, resolvedName );
      return resolvedName;
    },

    /**
     * @public
     * Fixes fileName and path to be compliant with JavaScript syntax
     *
     * @param {string} fileName
     * @returns {string}
     */
    getFixedFileName: function ( fileName ) {
      return fileName.replace( /\\/g, "\\\\" );
    },

     /**
     * Get path relative to project dir
     * @param {String} root
     * @param {String} srcMapFile
     */
    setSourceMapRoot: function( root, srcMapFile ){
      var rootResolved = npath.join( npath.dirname( srcMapFile ), root );
      if ( !fs.existsSync( rootResolved ) ) {
        throw new Error( "Source map root  `" + rootResolved + "` doesn't exist" );
      }
      sourceMapRoot = root;
    },
    /**
     * If source map root given, resolve files paths:
     * root = `build/map/`
     * sources at `src`
     * file = `src/Folder/File.js`
     * resolved: `build/map/Folder/File.js`
     * @param {String} filename
     * @returns {String}
     */
    resolveRelativeScrPath: function( filename ){
      return sourceMapRoot ? npath.join( sourceMapRoot, filename.substr( srcRelPath.length ) ) : filename;
    }
  };
};