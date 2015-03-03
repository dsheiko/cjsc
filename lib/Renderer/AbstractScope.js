/*
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* jshint unused:false
*/

"use strict";

module.exports = function() {
  return {
    /**
     * @private
     * Fixes fileName and path to be compliant with JavaScript syntax
     *
     * @param {string} fileName
     * @returns {string}
     */
    getFixedFileName: function ( fileName ) {
      return fileName.replace( /\\/g, "\\\\" );
      // it may lead to errors in some browsers if we use '/' and sourcemap use '\\\\'
      //return fileName.replace(/[\\]/g, '/');
    }
  };
};
