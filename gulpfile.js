var gulp	= require('gulp');
var del 	= require('del');
var sass 	= require('gulp-sass');
var please 	= require('gulp-pleeease');
var concat      = require('gulp-concat');
var uglify 	= require('gulp-uglify');
var jade 	= require('gulp-jade');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;
//var imagemin = require('gulp-imagemin');
//var pngquant = require('imagemin-pngquant');

gulp.task('clean', function (cb) {
	del(['./build/'], cb);
});

gulp.task('copy',function () {
	return gulp.src('./src/js/**/*.js', {
		base: 'src'
	}).pipe(gulp.dest('./build'))
	.pipe(reload({stream: true}));
});

gulp.task('sass', function () {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(sass({errLogToConsole: true}))
        .pipe(please({
   	        minifier: false,
        	autoprefixer: {
        		browsers: ['last 2 versions']
        	}
        }))
        .pipe(gulp.dest('./build/css'))
        .pipe(reload({stream: true}));
});

gulp.task('images', function () {
    return gulp.src('./src/img/**/*.*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./build/img'))
        .pipe(reload({stream: true}));
});

gulp.task('build-js', function () {
	return gulp.src(['./src/js/**/*.js', , '!./src/js/vendor/*.js'])
		.pipe(concat('app.js'))
        .pipe(uglify({preserveComments: 'some'})) // Keep some comments
		.pipe(gulp.dest('./build/js'))
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

gulp.task('serve',['dev'], function() {
  browserSync({
    server: {
      baseDir: 'build'
    }
  });
	gulp.watch('./src/jade/**/*.jade', ['templates']);
	gulp.watch('./src/scss/**/*.scss', ['sass']);
	gulp.watch('./src/css/**/*.css', ['copy']);
	gulp.watch('./src/js/**/*.js', ['copy']);
});

gulp.task('build', ['sass', 'copy', 'build-js', 'templates']);
gulp.task('dev', ['sass', 'copy', 'templates']);

gulp.task('default', ['clean'], function (cb) {
  runSequence('dev', ['sass', 'copy', 'templates'], cb);
});

gulp.task('builder', ['clean'], function (cb) {
  runSequence('build', ['sass', 'build-js', 'templates'], cb);
});
