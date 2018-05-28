module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
  ejs: {
    all: {
      src: ['views/*.ejs'],
      dest: 'public/',
      expand: true,
      ext: '.html',
    },
  },
});

  // Load the plugin that provides the "uglify" task.
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ejs');

  // Default task(s).
  grunt.registerTask('default', ['ejs']);

};