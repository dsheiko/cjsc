var cjsc = require( ".././cjsc-module" ),
    args = {
      targets: [ "./demo/use-main-flow.js", "/tmp/build.js" ],
      options: {
        debug: true
      },
      plugins: []
    },
    config = {
      "foo": {
         "globalProperty": "foo"
       }
    };

cjsc( args, config, function( code ){
  console.log( "All done. Generated code:", code );
});