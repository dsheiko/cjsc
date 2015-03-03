/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

"use strict";

/** @module fs */
var fs = require( "fs" ),
    /** @module path */
    npath = require( "path" );

/**
 *
 * @param {string} srcPath
 */
module.exports = function( srcPath ){
  var
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
     srcRelPath = srcPath.substr( cwd.length ).replace( /^\//, "" );

  return {
    /**
     * Resolve the path given in config
     * @param {string} relPath
     * @returns {string}
     */
    resolvePath: function( relPath ) {
      var path = npath.resolve( relPath );
      if ( !fs.existsSync( path ) || !fs.statSync( path ).isFile() ) {
        path = npath.resolve( relPath + ".js" );
        if ( !fs.existsSync( path ) || !fs.statSync( path ).isFile() ) {
          throw new ReferenceError( "Could't resolve dependency `" + path + "` specified in the configuration. " +
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
    * @param {string} pathArg
    * @param {Function} [done]
    * @return {string}
    */
    readJs: function( pathArg, done ) {

      if ( typeof pathArg !== "string" ) {
        throw new TypeError( "file path must be a string. " + typeof pathArg + " found" );
      }

      if ( !fs.existsSync( pathArg ) || !fs.statSync( pathArg ).isFile() ) {
        pathArg = pathArg + ".js";
        if ( !fs.existsSync( pathArg ) || !fs.statSync( pathArg ).isFile() ) {
          throw new ReferenceError( pathArg + " doesn't exist\n" );
        }
      }
      if ( done ) {
        return this.readStream( pathArg, done );
      }
      return fs.readFileSync( pathArg, "utf-8" );
    },
    /**
    *
    * @param {string} pathArg
    * @param {Function} done
    * @return {string}
    */
    readStream: function( pathArg, done ) {
      var all = [],
          stream;

      stream = fs.createReadStream( pathArg, {
        encoding: "utf-8"
      });
//      stream.pipe(piping("..", {replace: [
//        { from: /0\.3\.0/, to: "1.0.O" }
//      ]}));

      stream
        .on("data", function (data) {
          all.push(data);
        })
        .on("end", function () {
          done( all.toString() );
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
      var dirname = calleeFilename ? npath.dirname( calleeFilename ) : srcPath,
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