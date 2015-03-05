var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var please = require('gulp-pleeease');
var concat = require('gulp-concat');
var jade = require('gulp-jade');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

gulp.task('clean', function (cb) {
	del(['./build/'], cb);
});

gulp.task('copy', ['clean'],function () {
	return gulp.src(['./src/css/**/*.css', './src/js/**/*.js'], {
		base: 'src'
	}).pipe(gulp.dest('./build'));
});

gulp.task('sass', ['clean'], function () {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(sass({errLogToConsole: true}))
        .pipe(please({
   	        minifier: false,
        	autoprefixer: {
        		browsers: ['last 2 versions']
        	}
        }))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('images', function () {
    return gulp.src('./src/img/**/*.*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./build/img'));
});

gulp.task('build-js', function () {
	return gulp.src('./src/js/**/*.js')
		.pipe(concat('app.js'))
        .pipe(uglify({preserveComments: 'some'})) // Keep some comments
		.pipe(gulp.dest('./build/js'));
});

gulp.task('templates', function() {
	'use strict';
	var YOUR_LOCALS = {};
	return gulp.src('./src/jade/*.jade')
		.pipe(jade({
			locals: YOUR_LOCALS,
			pretty: true
		}))
		.pipe(gulp.dest('./build/'));
});

gulp.task('watch', function() {
	gulp.watch('./src/jade/**/*.jade', ['templates']);
	gulp.watch('./src/scss/**/*.scss', ['sass']);
	gulp.watch('./src/css/**/*.css', ['copy']);
	gulp.watch('./src/js/**/*.js', ['copy']);
});

gulp.task('dev', ['watch', 'sass', 'copy', 'images', 'templates']);
gulp.task('build', ['clean','sass', 'images', 'build-js', 'templates']);
