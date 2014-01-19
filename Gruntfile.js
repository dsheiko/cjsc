module.exports = function(grunt) {

  grunt.loadNpmTasks( "grunt-contrib-jshint" );
  grunt.loadNpmTasks( "grunt-mocha-cli" );
	grunt.loadNpmTasks( "grunt-contrib-jscs" );

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            all: [ "lib/**/*.js", "test/*.js" ]
        },
        mochacli: {
            test: {
                options: {
                    reporter: "spec"
                },
                src: [ "test/unit-tests.js" ]
            }
        },
				jscs: {
						options: {
								"standard": "Jquery"
						},
						all: ["lib"]
				}
    });

  grunt.registerTask( "test", [ "jshint", "jscs", "mochacli" ] );
  grunt.registerTask( "default", [ "test" ] );

};
