/*jshint -W068 */
/*jshint multistr: true */
/** @type {function} Compiler constructor */
var ClassUnderTest = require( "../../lib/Renderer/Script" ),
    fSys = new require( "../../lib/FileSystem" )({ srcPath: ".." }),
    fs = require( "fs" );

require( "should" );

describe( "lib/Renderer/Script", function(){
  before(function(){
    this.instance = new ClassUnderTest( fSys );
  });
  describe( "getHeader", function(){
    it( "return intended code", function(){
      this.instance.getHeader().length.should.be.ok;
    });
  });
  describe( "getFooter", function(){
    it( "return intended code", function(){
      this.instance.getHeader( ".." ).length.should.be.ok;
    });
  });

});
