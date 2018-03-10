module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        eslint: {
            target: [
                "./index.js",
                "./bin/*.js",
                "./lib/*.js"
            ]
        }
    });
    grunt.registerTask('default', ['eslint']);
    grunt.registerTask('lint', ['eslint']);
};
