'use strict';

// Перенос картинок и шрифтов

/**
 * Перенос на e92
 * 1. Перенести все что можно в bower
 * 2. Перенести все css, sass
 * 3. Все что не попало в bower в js/scripts и sass/partials
 *
 * BOWER:
 * intro.js
 * jquery.autocomplete
 * jquery.tooltipster
 * jquery.tagsinput
 * jqjquery-wysibb
 * html5-history-api
 * fancyBox
 * dw-bxslider-4
 * jquery.raty
 * chosen
 * swfobject
 * tinymce-dist
 * jquery-ui
 * jQuery-Timepicker-Addon
 * jstree
 * jquery-cookie
 * jqgrid
 */

var gulp = require('gulp'),
  sass = require('gulp-sass'),
  less = require('gulp-less'),
  autoprefixer = require('gulp-autoprefixer'),
  livereload = require('gulp-livereload'),
  plumber = require("gulp-plumber"),
  minifycss = require('gulp-minify-css'),
  browserify = require('browserify'),
  debowerify = require('debowerify'),
  source = require('vinyl-source-stream'),
  concat = require('gulp-concat'),
  babelify = require('babelify'),
  envify = require('envify/custom'),
  filter = require('gulp-filter'),
  mainBowerFiles = require('main-bower-files'),
  sourcemaps = require('gulp-sourcemaps'),
  es = require("event-stream"),
  buffer = require('vinyl-buffer'),
  uglify = require('gulp-uglify'),
  join = require('path').join,
  colors = require('colors');

var NODE_ENV = process.env.NODE_ENV || 'development';
var vendorBuild = false;

var cnf = {
  publicPathJs: join(__dirname, 'assets/js'),
  publicPathCss: join(__dirname, 'assets/css'),
  js: {
    path: join(__dirname, 'src/js'),
    main: 'bootstrap.js',
    result: 'bundle.js'
  },
  css: {
    path: join(__dirname, 'src/sass'),
    main: 'bootstrap.scss',
    result: 'bundle.css'
  }
};

function log(error) {
  console.log([
    '',
    "----------ERROR MESSAGE START----------".bold.red.underline,
    ("[" + error.name + " in " + error.plugin + "]").red.bold.inverse,
    error.message,
    "----------ERROR MESSAGE END----------".bold.red.underline,
    ''
  ].join('\n'));
  this.emit('end');
}

gulp.task('build-sass', function () {
  if (!vendorBuild) {
    var vendors = mainBowerFiles();
    gulp.src(vendors)
      .pipe(plumber())
      .pipe(filter(['**.css', '**.less']))
      .pipe(less())
      .pipe(concat('vendor.css'))
      .pipe(gulp.dest(join(__dirname, '/src')));

    vendorBuild = true;
  }

  var vendorCSS = gulp.src(join(__dirname, '/src/vendor.css'));
  var bundleCSS = gulp.src([
    join(cnf.css.path, cnf.css.main),
  ])
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 20 versions'],
      cascade: true
    }));

  return es.merge(vendorCSS, bundleCSS)
    .pipe(sourcemaps.init({loadMaps: NODE_ENV == 'development'}))
    .pipe(concat(cnf.css.result))
    .pipe(minifycss({compatibility: 'ie8'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(cnf.publicPathCss))
    .pipe(livereload());
});

gulp.task('build-js', function () {
  var bundler = browserify({
    basedir: cnf.js.path,
    paths: ['components', 'plugins'],
    debug: NODE_ENV == 'development'
  })
    .add(join(cnf.js.path, cnf.js.main))
    .transform(envify({
      NODE_ENV: NODE_ENV
    }))
    .transform(debowerify)
    .transform(babelify, {
      only: cnf.js.path
    })
    .transform({
      global: true
    }, 'uglifyify');

  return bundler.bundle().on('error', log)
    .pipe(source(cnf.js.result))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: NODE_ENV == 'development'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(cnf.publicPathJs))
    .pipe(livereload());
});

gulp.task('vendor', function () {
  vendorBuild = false;
});

gulp.task('watch', function () {
  livereload.listen();

  // Sass
  gulp.watch([
    join(cnf.css.path, cnf.css.main),
  ], ['build-sass']);

  // Bower vendor
  gulp.watch([
    './bower.json'
  ], ['vendor', 'build-sass']);

  // JS
  gulp.watch([
    join(cnf.js.path, cnf.js.main),
  ], ['build-js']);
});

gulp.task('default', [
  'build-sass',
  'build-js',
  'watch'
]);