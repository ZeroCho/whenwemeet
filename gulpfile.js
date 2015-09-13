var gulp = require('gulp');
var	minifycss = require('gulp-minify-css');
var	autoprefixer = require('gulp-autoprefixer');
var	uglify = require('gulp-uglify');
var	concat = require('gulp-concat');
var	rename = require('gulp-rename');
var	watch = require('gulp-watch');
var	nodemon = require('gulp-nodemon');
var	livereload = require('gulp-livereload');
//var compass = require('gulp-compass');
var	del = require('del');
var	dusthtml = require('gulp-dust-html');
var	plumber = require('gulp-plumber');
var	path = require('path');

var	dir = {
	sass: {
		root: 'www/sass/',
		src: 'www/sass/*.sass',
		cssSrc: 'www/css',
		compassSrc: 'www/sass'
	},
	css: {
		root: 'www/css/',
		filename: 'whenwemeet.css'
	},
	js: {
		root: 'www/js/',
		src: 'www/js/*.js',
		filename: 'whenwemeet.js'
	},
	dust: {
		src: 'views/*.dust'
	},
	dist: {
		root: 'www/dist/',
		js: 'www/dist/whenwemeet.js',
		css: 'www/dist/whenwemeet.css'
	},
	www: {
		root: 'www/'
	}
};
	
gulp.task('default', ['product']);
gulp.task('build', ['styles', 'scripts', 'dust']);
gulp.task('product', ['build', 'serve', 'watch']);
gulp.task('watch', ['clean'], function () {
	livereload.listen();
	gulp.watch(dir.js.src, ['scripts'], function (e) {
		console.log('watch scripts', e, e.path);
		gulp.src(e.path)
			.pipe(plumber())
			.pipe(livereload());
	});
	gulp.watch(dir.sass.src, ['styles'], function (e) {
		console.log('watch sass', e, e.path);
		gulp.src(e.path)
			.pipe(plumber())
			.pipe(livereload());
	});
	gulp.watch(dir.dust.src, ['dust'], function (e) {
		console.log('watch dust', e, e.path);
	});
	gulp.watch([dir.dist.css, dir.dist.js], function (event) {
		gulp.src(event.path)
			.pipe(plumber())
			.pipe(livereload());
	});
	//gulp.watch(['www/phonegapHandler.js'], function (event) {
	//	gulp.src(event.path)
	//		.pipe(plumber())
	//		.pipe(gulp.dest(dir.www.root))
	//		.pipe(livereload());
	//});
});
gulp.task('serve', ['build'], function () {
	return nodemon({
		script: './bin/www'
	});
});
gulp.task('scripts', ['js:uglify']);
gulp.task('styles',function () {
	gulp.src(dir.dist.css)
		.pipe(plumber())
	//	.pipe(compass({
	//		css: dir.js.dest,
	//		sass: dir.sass.compassSrc
	//	}))
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie9', 'opera 12.1', 'ios 6'))
		.pipe(rename('whenwemeet.css'))
	 	.pipe(gulp.dest(dir.dist.root))
		.pipe(minifycss())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(dir.dist.root));
});
gulp.task('clean', function () {
	del([dir.dist.root + 'whenwemeet.min.js', dir.dist.root + 'whenwemeet.js']);
});

gulp.task('js:concat', ['styles'], function () {
	gulp
		.src([
			'www/js/wwm.js',
			'www/js/wwm.model.js',
			'www/js/wwm.shell.js',
			dir.js.src
		])
		.pipe(plumber())
		.pipe(concat(dir.js.filename))
		.pipe(gulp.dest(dir.dist.root));

});
gulp.task('js:uglify', ['js:concat'], function () {
	gulp.src(dir.dist.root + dir.js.filename)
		.pipe(plumber())
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(dir.dist.root));
});
gulp.task('dust', function () {
	gulp.src(dir.dust.src)
		.pipe(plumber())
		.pipe(dusthtml({
			basePath: 'views',
			whitespace: false,
			data: {
				title: '우리언제만나'
			}
		}))
		.pipe(gulp.dest(dir.www.root))
		.pipe(livereload());
	//gulp.src('www/wwm.appcache')
	//	.pipe(gulp.dest(dir.dist.root));
});
