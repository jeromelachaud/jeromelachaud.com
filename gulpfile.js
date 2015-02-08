var gulp = require('gulp');
var del = require('del');
// var sass = require('gulp-sass');
var concat = require('gulp-concat');
var jade = require('gulp-jade');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');


gulp.task('clean', function (cb) {
	del(['build/**'], cb);
});

gulp.task('copy', function () {
	return gulp.src(['src/css/**/*.css', 'src/js/vendor/*.js'], {
		base: 'src'
	}).pipe(gulp.dest('build'));
});

gulp.task('images', function () {
    return gulp.src('src/img/**/*.*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./build/img'));
});

/*gulp.task('sass', function () {
    gulp.src('./src/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./build/css'));
});*/

gulp.task('concat', function () {
	return gulp.src('./src/js/*.js')
		.pipe(gulp.dest('./build/js'));
});

gulp.task('templates', function() {
	'use strict';
	var YOUR_LOCALS = {};
	gulp.src('./src/jade/*.jade')
		.pipe(jade({
			locals: YOUR_LOCALS,
			pretty: true
		}))
		.pipe(gulp.dest('./build/'))
});

gulp.task('watch', function() {
	gulp.watch('./src/jade/**/*.jade', ['templates']);
	gulp.watch('./src/scss/**/*.scss', ['sass']);
	gulp.watch('./src/css/**/*.css', ['copy']);
	gulp.watch('./src/js/*.js', ['concat']);
});


// The default task (called when you run `gulp` from cli)
gulp.task('dev', ['watch', 'copy', 'images', 'templates', 'concat']);
gulp.task('build', ['clean', 'copy', 'images', 'templates', 'concat']);