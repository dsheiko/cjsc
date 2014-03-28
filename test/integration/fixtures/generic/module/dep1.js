window.log.push( "dep1.js:runs" );
window.log.push( "dep1.js:__diname:" + __dirname );
window.log.push( "dep1.js:__filename:" + __filename );
window.log.push( "dep1.js:exports:" + require( "./dep2/dep2" ).name );
module.exports.name = "dep1-import";