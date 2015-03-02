module.exports = function(grunt) {

  grunt.loadNpmTasks( "grunt-contrib-jshint" );
  grunt.loadNpmTasks( "grunt-mocha-cli" );
	grunt.loadNpmTasks( "grunt-contrib-jscs" );
	grunt.loadNpmTasks( "grunt-contrib-qunit" );

	grunt.initConfig({
			jshint: {
					options: {
							jshintrc: ".jshintrc"
					},
					all: [ "lib/**/*.js", "test/*.js" ]
			},
			qunit: {
				all: ["test/integration/index.html"]
			},
			mochacli: {
					test: {
							options: {
									reporter: "spec"
							},
							src: [ "test/unit/unit-tests.js" ]
					}
			},
			jscs: {
        app: {
          options: {
            standard: "Jquery"
          },
          files: {
            src: [ "./lib" ]
          }
        }
			}
	});

	grunt.registerTask( "build-test", "Build all acceptance tests artifacts", function() {
    var done = this.async(),
        exec = require("child_process").exec,
				EXE = "node cjsc.js",
				SRC = "./test/integration",
				runExec,
        bundles = [
					SRC + "/fixtures/generic/main.js " + SRC + "/build/generic.js",
					SRC + "/fixtures/umd/main.js " + SRC + "/build/umd.js",
					SRC + "/fixtures/non-module/main.js " + SRC + "/build/non-module.js",
					SRC + "/fixtures/3rd-party/main.js " + SRC + "/build/3rd-party.js",
					SRC + "/fixtures/mustache/main.js " + SRC + "/build/mustache.js",
					SRC + "/fixtures/handlebars/main.js " + SRC + "/build/handlebars.js",
					SRC + "/fixtures/dependency-config/reference/main.js " + SRC +
						"/build/dependency-config-reference.js --config=" + SRC +
						"/fixtures/dependency-config/reference/config.json",
					SRC + "/fixtures/dependency-config/alias/main.js " + SRC +
						"/build/dependency-config-alias.js --config=" + SRC +
						"/fixtures/dependency-config/alias/config.json",
					SRC + "/fixtures/dependency-config/require-a/main.js " + SRC +
						"/build/dependency-config-require-a.js --config=" + SRC +
						"/fixtures/dependency-config/require-a/config.json",
					SRC + "/fixtures/dependency-config/require-b/main.js " + SRC +
						"/build/dependency-config-require-b.js --config=" + SRC +
						"/fixtures/dependency-config/require-b/config.json"
				];

     grunt.log.writeln( "Running test build" );
		 runExec = function(){
			 var bundle = bundles.shift(),
					 cmd = EXE + " " + bundle;
			  grunt.verbose.writeln( "Exec: " + cmd );
				console.log( bundle.replace( /\s.*?$/g, "" ) );
				exec( cmd, function( err, stdout ) {
				 if ( stdout ) {
					 grunt.log.write( stdout );
					 if ( bundles.length ) {
							runExec();
					 } else {
						 done();
					 }
				 }
				 if ( err ) {
					 grunt.fatal( err );
					 done();
				 }
			 });
		 };
		 runExec();
  });

  grunt.registerTask( "test", [ "jshint", "jscs", "mochacli", "build-test", "qunit" ] );
	grunt.registerTask( "integration", [ "jshint", "jscs", "build-test", "qunit" ] );
  grunt.registerTask( "default", [ "test" ] );

};
