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

gulp.task('clean', function (cb) {
	del(['./build/'], cb);
});

gulp.task('sass', function () {
  return gulp.src(['./src/scss/*.scss', './src/scss/vendors/*.scss'])
  .pipe(sass({errLogToConsole: true}))
  .pipe(autoprefixer({
    autoprefixer: {browsers: ['last 2 versions']}  
  }))
  .pipe(gulpif(argv.production, rename({suffix: '.min'})))
  .pipe(gulpif(argv.production, minifyCSS({keepBreaks:false})))
  .pipe(gulp.dest('./build/css'))
  .pipe(reload({stream: true}));
});

gulp.task('images', function () {
  return gulp.src('./src/img/**/*.*')
  .pipe(imagemin({
    progressive: true,
    optimizationLevel : 8
  }))
  .pipe(gulp.dest('./build/img'))
  .pipe(reload({stream: true}));
});

gulp.task('javascript', function () {
  return gulp.src(['./src/js/vendors/*.js', './src/js/**/*.js'], {base: 'src' })
  .pipe(gulpif(argv.production, concat('js/app.js')))
  .pipe(gulpif(argv.production, rename({suffix: '.min'})))
  .pipe(gulpif(argv.production, uglify({preserveComments: 'some'}))) // Keep some comments
  .pipe(gulp.dest('./build/'))
  .pipe(reload({stream: true}));
});

gulp.task('templates', function() {
	'use strict';
	var YOUR_LOCALS = {};
	return gulp.src('./src/jade/*.jade')
  .pipe(jade({
    locals: YOUR_LOCALS,
    pretty: true
  }))
  .pipe(gulp.dest('./build/'))
  .pipe(reload({ stream:true }));
});

gulp.task('dev',['builder'], function() {
  browserSync({
    server: {
      baseDir: 'build'
    }
  });
  gulp.watch('./src/jade/**/*.jade', ['templates']);
  gulp.watch('./src/scss/**/*.scss', ['sass']);
  gulp.watch('./src/js/**/*.js', ['copy']);
});

gulp.task('builder', ['clean'], function (cb) {
  runSequence(['sass', 'javascript', 'templates', 'images'], cb);
});
