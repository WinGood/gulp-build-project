'use strict';
// Узкие места
// 1. bootstrap.js
// 2. обработка gulp ошибок +
// 3. подгрузка vendor css +
// 4. gulpfile change restart -
// 5. интеграция с bower.json +
// 6. контроллеры -> модули
// 7. NODE_ENV +
// 8. Перейти на webpack -
// 9. Babel +
// 10. Кэширование bower зависимостей
// 11. Настроить конфиги +
// 12. 2 Сборки dev, production +

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
  //lazypipe = require('lazypipe'),
  es = require("event-stream"),
  buffer = require('vinyl-buffer'),
  uglify = require('gulp-uglify'),
  join = require('path').join,
  colors = require('colors');

var NODE_ENV = process.env.NODE_ENV || 'development';
var cnf = {
  publicPathJs: join(__dirname, 'assets/js'),
  publicPathCss: join(__dirname, 'assets/css'),
  app: {
    pathJS: join(__dirname, 'src/js'),
    pathCSS: join(__dirname, 'src/sass'),
    main: 'bootstrap.js',
    result: 'bundle.js'
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
  var vendors   = mainBowerFiles();
  var vendorCSS = gulp.src(vendors)
    .pipe(plumber())
    .pipe(filter(['**.css', '**.less']))
    .pipe(less())

  var bundleCSS = gulp.src([
    join(cnf.app.pathCSS, '**/*.sass'),
    join(cnf.app.pathCSS, '**/*.scss'),
  ])
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 20 versions'],
      cascade: true
    }));

  return es.merge(vendorCSS, bundleCSS)
    .pipe(concat('bundle.css'))
    .pipe(minifycss({compatibility: 'ie8'}))
    .pipe(gulp.dest(cnf.publicPathCss))
    .pipe(livereload());
});

gulp.task('build-js', function () {
  var bundler = browserify({
    basedir: cnf.app.pathJS,
    paths: ['components', 'plugins'],
    debug: NODE_ENV == 'development'
  })
    .add(join(cnf.app.pathJS, cnf.app.main))
    .transform(envify({
      NODE_ENV: NODE_ENV
    }))
    .transform(debowerify)
    .transform(babelify, {
      only: cnf.app.pathJS
    })
    .transform({
      global: true
    }, 'uglifyify');

  bundler.bundle().on('error', log)
    .pipe(source(cnf.app.result))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: NODE_ENV == 'development'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(cnf.publicPathJs))
    .pipe(livereload());
});

gulp.task('watch', function () {
  livereload.listen();
  // Template
  gulp.watch([
    './tmpl/*.php',
    './tmpl/**/*.php'
  ], function (e) {
  }).on('change', livereload.changed);

  // Sass
  gulp.watch([
    join(cnf.app.pathCSS, '**/*.sass'),
    join(cnf.app.pathCSS, '**/*.scss'),
  ], ['build-sass']);

  // JS
  gulp.watch([
    join(cnf.app.pathJS, '**/**.js')
  ], ['build-js']);
});

gulp.task('default', [
  'build-sass',
  'build-js',
  'watch'
]);