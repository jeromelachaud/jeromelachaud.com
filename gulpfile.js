'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var argv = require('yargs').argv;
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var del = require('del');
var size = require('gulp-size');
var gulpif = require('gulp-if');
var htmlreplace = require('gulp-html-replace');
var jade = require('gulp-jade');
var jshint = require('gulp-jshint');
var minifyCSS = require('gulp-minify-css');
var reload = browserSync.reload;
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');

var basePaths = {
	src: 'src/',
	dest: 'build/'
};

var paths = {
	styles: {
		src: basePaths.src + 'styles/',
		dest: basePaths.dest + 'css/'
	},
	scripts: {
		src: basePaths.src + 'scripts/',
		dest: basePaths.dest + 'js/'
	},
	images: {
		src: basePaths.src + 'images/',
		dest: basePaths.dest + 'img/'
	},
	templates: {
		src: basePaths.src + 'templates/',
		dest: basePaths.dest
	},
	fonts: {
		src: basePaths.src + 'fonts/',
		dest: basePaths.dest + 'css/fonts/'
	}
};

gulp.task('clean', function (cb) {
	del([basePaths.dest], cb);
});

gulp.task('styles', function () {
	return gulp.src([
		paths.styles.src + '**/*.scss',
	])
	.pipe(gulpif(argv.dev, sourcemaps.init()))
	.pipe(sass({errLogToConsole: true}))
	.pipe(autoprefixer({
		autoprefixer: {browsers: ['last 2 versions']}
	}))
	.pipe(gulpif(argv.production, rename({suffix: '.min'})))
	.pipe(gulpif(argv.production, minifyCSS({keepBreaks:false})))
	.pipe(gulpif(argv.dev, sourcemaps.write()))
	.pipe(gulp.dest((paths.styles.dest)))
	.pipe(reload({stream: true}))
	.pipe(size({title: 'styles'}));
});

gulp.task('scripts', function () {
	return gulp.src([
		paths.scripts.src + 'vendors/*.js',
		paths.scripts.src + '*.js'
		])
	.pipe(jshint('.jshintrc'))
	.pipe(jshint.reporter('default'))
	.pipe(size({title: 'scripts'}))
	.pipe(gulpif(argv.production, concat('app.js')))
	.pipe(gulpif(argv.production, rename({suffix: '.min'})))
	.pipe(gulpif(argv.production, uglify({preserveComments: 'some'})))// Keep some comments
	.pipe(gulp.dest((paths.scripts.dest)));
});

gulp.task('templates', function() {
	var YOUR_LOCALS = {};
	return gulp.src(paths.templates.src + '*.jade')
	.pipe(jade({
		locals: YOUR_LOCALS,
		pretty: true
	}))
    .pipe(gulpif(argv.production, htmlreplace({
	'styles_vendors': 'css/vendors/bootstrap/bootstrap.min.css', // add some more if needed
	'styles': 'css/styles.min.css',
	'js_production': 'js/app.min.js'
    })))
	.pipe(gulp.dest(basePaths.dest))
	.pipe(size({title: 'html'}));
});

gulp.task('images', function () {
	return gulp.src(paths.images.src + '**/*.*')
	.pipe(imagemin({
		progressive: true,
		optimizationLevel : 8
	}))
	.pipe(gulp.dest(paths.images.dest))
	.pipe(size({title: 'images'}));
});

gulp.task('fonts', function() {
	gulp.src(paths.fonts.src + '**/*.*')
	.pipe(gulp.dest('build/css/fonts/'))
	.pipe(size({title: 'fonts'}));
});

gulp.task('default', ['builder'], function() {
	browserSync({
		server: {
			baseDir: basePaths.dest
		}
	});
	gulp.watch(paths.styles.src + '**/*.scss', ['styles']);
	gulp.watch(paths.scripts.src + '**/*.js', ['scripts', reload]);
	gulp.watch(paths.templates.src + '**/*.jade', ['templates', reload]);
	gulp.watch(paths.images.src + '**/*.*', ['images', reload]);
	gulp.watch(paths.fonts.src + '**/*', ['fonts', reload]);
});

gulp.task('builder', ['clean'], function (cb) {
	runSequence(['styles', 'scripts', 'templates', 'images', 'fonts'], cb);
});
