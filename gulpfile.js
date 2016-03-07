var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var iife = require('gulp-iife');

var src = 'src/**/*.js';

gulp.task('build-dev', function buildDev() {
	return gulp.src(src)
		.pipe(concat('angular-middleware.js'))
		.pipe(iife({
			params: ['angular']
		}))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('build-prod', ['build-dev'], function buildProd() {
	return gulp.src('dist/angular-middleware.js')
		.pipe(uglify())
		.pipe(rename(function rename(path) {
			path.basename += '.min';
		}))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function watch() {
	gulp.watch(src, ['build-dev']);
});

gulp.task('watch-prod', function watchProd() {
	gulp.watch(src, ['build-prod']);
});

gulp.task('default', ['build-dev']);
