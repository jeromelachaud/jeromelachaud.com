var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    argv = require('yargs').argv,
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    del = require('del'),
    gulpif = require('gulp-if'),
    jade = require('gulp-jade'),
    minifyCSS = require('gulp-minify-css');
    reload = browserSync.reload,
    rename = require('gulp-rename'),
    runSequence = require('run-sequence'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    sourcemaps = require('gulp-sourcemaps');

var basePaths = {
  src: 'src/',
  dest: 'build/',
};

var paths = {
  styles: {
    src: basePaths.src + 'scss/',
    dest: basePaths.dest + 'css/'
  },
  javascript: {
    src: basePaths.src + 'js/',
    dest: basePaths.dest + 'js/'
  },
  images: {
    src: basePaths.src + 'img/',
    dest: basePaths.dest + 'img/'
  },
  templates: {
    src: basePaths.src + 'jade/',
    dest: basePaths.dest
  }
}

gulp.task('clean', function (cb) {
	del([basePaths.dest], cb);
});

gulp.task('sass', function () {
  return gulp.src([paths.styles.src + '*.scss', paths.styles.src + '/vendors/*.scss'])
  .pipe(gulpif(argv.dev, sourcemaps.init()))
  .pipe(sass({errLogToConsole: true}))
  .pipe(autoprefixer({
    autoprefixer: {browsers: ['last 2 versions']}  
  }))
  .pipe(gulpif(argv.production, rename({suffix: '.min'})))
  .pipe(gulpif(argv.production, minifyCSS({keepBreaks:false})))
  .pipe(gulpif(argv.dev, sourcemaps.write()))
  .pipe(gulp.dest((paths.styles.dest)))
  .pipe(reload({stream: true}));
});

gulp.task('images', function () {
  return gulp.src(paths.images.src + '/**/*.*')
  .pipe(imagemin({
    progressive: true,
    optimizationLevel : 8
  }))
  .pipe(gulp.dest(paths.images.dest))
  .pipe(reload({stream: true}));
});

gulp.task('javascript', function () {
  return gulp.src([paths.javascript.src + 'vendors/*.js', paths.javascript.src + '**/*.js'], {base: 'src' })
  .pipe(gulpif(argv.production, concat('js/app.js')))
  .pipe(gulpif(argv.production, rename({suffix: '.min'})))
  .pipe(gulpif(argv.production, uglify({preserveComments: 'some'}))) // Keep some comments
  .pipe(gulp.dest(basePaths.dest))
  .pipe(reload({stream: true}));
});

gulp.task('templates', function() {
	'use strict';
	var YOUR_LOCALS = {};
	return gulp.src(paths.templates.src + '*.jade')
  .pipe(jade({
    locals: YOUR_LOCALS,
    pretty: true
  }))
  .pipe(gulp.dest(basePaths.dest))
  .pipe(reload({ stream:true }));
});

gulp.task('default',['builder'], function() {
  browserSync({
    server: {
      baseDir: basePaths.dest
    }
  });
  gulp.watch(paths.templates.src + '**/*.jade', ['templates']);
  gulp.watch(paths.styles.src +'**/*.scss', ['sass']);
  gulp.watch(paths.javascript.src + '**/*.js', ['javascript']);
});

gulp.task('builder', ['clean'], function (cb) {
  runSequence(['sass', 'javascript', 'templates', 'images'], cb);
});
