/* global module */

module.exports = function (grunt) {

  'use strict';

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['src/{,*/}*.js'],
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      scss: {
        files: ['src/assets/scss/{,*/}*.{scss,sass}'],
        tasks: ['sass:server']
      },
      css: {
        files: ['src/assets/css/{,*/}*.css'],
        // tasks: ['autoprefixer'],
        options: {
            livereload: true
        }
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          'src/{,*/}*.html',
          'src/assets/img/{,*/}*'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        open: true,
        livereload: 35729,
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              connect.static('src')
            ];
          }
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        'src/{,*/}*.js',
        '!src/libraries'
      ]
    },

    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {
        loadPath: [ 'src/assets/scss', 'src/libraries/susy/sass', 'src/libraries/breakpoint-sass/stylesheets' ]
      },
      server: {
        files: [{
          expand: true,
          cwd: 'src/assets/scss',
          src: 'main.scss',
          dest: 'src/assets/css',
          ext: '.css'
        }]
      }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 2 versions', 'ie 9', 'ie 10', 'ie 11', 'Firefox ESR', '> 0.5%'],
        diff: true
      },
      main: {
        src: 'src/assets/css/main.css'
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      core: {
        files: [
          {
            expand: true,
            dot:    true,
            cwd:    'src',
            dest:   'dist',
            src: [
              '*.{html,js}',
              '.htaccess',
              'assets/css/{,*/}*.*',
              // 'assets/img/*.{png,jpg,gif}',
              'assets/img/**/*',
              'assets/fonts/{,*/}*.*',
              'data/*.json',
              'app/**/*'
            ]
          }
        ]
      },
      libraries: {
        files: [
          {
            expand: true,
            dot:    true,
            cwd:    'src/libraries',
            dest:   'dist/libraries',
            src: [
              'angular/angular.min.js',
              'angular-ui-router/release/angular-ui-router.min.js',
              'angularfire/dist/angularfire.min.js',
              'angular-strap/src/tab/tab.js',
              'firebase/firebase.js',
              'lodash/lodash.min.js',
              'jquery/dist/jquery.min.js',
              'ngstorage/ngStorage.min.js'
            ]
          }
        ]
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '.sass-cache',
            'dist/*'
          ]
        }]
      },
      server: '.tmp'
    }

  });

  grunt.registerTask('serve', 'start the server and preview your app', function () {
    grunt.task.run([
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', function (target) {
      grunt.task.run([
        'clean:dist',
        'sass',
        'autoprefixer',
        'copy:core',
        'copy:libraries'
      ]);
    });

};