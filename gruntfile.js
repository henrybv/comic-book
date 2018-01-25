module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    });

    grunt.config( 'mochaTest', require('./grunt/mochaTest.js') );

    grunt.loadNpmTasks('grunt-mocha-test');
}