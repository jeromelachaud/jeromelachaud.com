'use strict';

var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	argv = require('yargs').argv,
	browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	del = require('del'),
	size = require('gulp-size'),
	gulpif = require('gulp-if'),
	htmlreplace = require('gulp-html-replace'),
	minifyCSS = require('gulp-minify-css'),
	reload = browserSync.reload,
	rename = require('gulp-rename'),
	runSequence = require('run-sequence'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	sourcemaps = require('gulp-sourcemaps');


var basePaths = {
	src: 'src/',
	dest: 'build/'
};

var paths = {
	styles: {
		src: basePaths.src + 'styles/',
		dest: basePaths.dest + 'assets/css/'
	},
	scripts: {
		src: basePaths.src + 'scripts/',
		dest: basePaths.dest + '/assets/js/'
	},
	images: {
		src: basePaths.src + 'images/',
		dest: basePaths.dest + '/images/'
	},
	fonts: {
		src: basePaths.src + 'fonts/',
		dest: basePaths.dest + 'assets/fonts/'
	}
};

gulp.task('clean', function (cb) {
	del([basePaths.dest], cb);
});

gulp.task('html', function () {
	gulp.src(basePaths.src + '*.html')
	.pipe(gulpif(argv.production, htmlreplace({
		'styles_production': 'css/styles.min.css',
		'js_production': 'js/main.min.js'
	})))
	.pipe(gulp.dest((basePaths.dest)));
});

gulp.task('styles', function () {
	return gulp.src([
		paths.styles.src + '**/*.*',
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
		paths.scripts.src + '**/*.js'
		])
	.pipe(size({title: 'scripts'}))
	.pipe(gulpif(argv.production, concat('main.js')))
	.pipe(gulpif(argv.production, rename({suffix: '.min'})))
	.pipe(gulpif(argv.production, uglify({preserveComments: 'some'})))// Keep some comments
	.pipe(gulp.dest((paths.scripts.dest)));
});

gulp.task('images', function () {
	return gulp.src(paths.images.src + '**/*.*')
	.pipe(imagemin({
		progressive: true,
		optimizationLevel : 8,
		svgoPlugins: [
			{ convertShapeToPath:false }
		]
	}))
	.pipe(gulp.dest(paths.images.dest))
	.pipe(size({title: 'images'}));
});

gulp.task('fonts', function() {
	gulp.src(paths.fonts.src + '**/*.*')
	.pipe(gulp.dest(paths.fonts.dest))
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
	gulp.watch(paths.images.src + '**/*.*', ['images', reload]);
	gulp.watch(paths.fonts.src + '**/*', ['fonts', reload]);
	gulp.watch(basePaths.src + '**/*.html', ['html', reload]);
});

gulp.task('builder', ['clean'], function (cb) {
	runSequence(['html','styles', 'scripts', 'images', 'fonts'], cb);
});
