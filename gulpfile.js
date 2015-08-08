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
		src: 'public/sass/*.sass',
		cssSrc: 'public/css',
		compassSrc: 'public/sass'
	},
	js: {
		src: 'public/js/*.js',
		filename: 'whenwemeet.js',
		dest: 'public/dist/'
	},
	dust: {
		src: 'views/*.dust'
	},
	dist: {
		js: 'public/dist/whenwemeet.js',
		css: 'public/dist/whenwemeet.css'
	},
	www: {
		index: 'www',
		dist: 'www/dist/'
	}
};
	
gulp.task('default', ['product']);
gulp.task('build', ['clean', 'styles', 'scripts', 'dust']);
gulp.task('product', ['build', 'serve', 'watch']);
gulp.task('watch', ['clean'], function () {
	livereload.listen();
	gulp.watch(dir.js.src, ['scripts'], function (e) {
		console.log('watch scripts', e, e.path);
	});
	gulp.watch(dir.sass.src, ['styles'], function (e) {
		console.log('watch sass', e, e.path);
	});
	gulp.watch(dir.dust.src, ['dust'], function (e) {
		console.log('watch dust', e, e.path);
	});
	gulp.watch([dir.dist.css, dir.dist.js], function (event) {
		gulp.src(event.path)
			.pipe(plumber())
			.pipe(livereload());
	});
	//gulp.watch(['public/phonegapHandler.js'], function (event) {
	//	gulp.src(event.path)
	//		.pipe(plumber())
	//		.pipe(gulp.dest(dir.www.index))
	//		.pipe(livereload());
	//});
});
gulp.task('serve', ['build'], function () {
	return nodemon({
		script: './bin/www'
	});
});
gulp.task('scripts', ['js:uglify']);
gulp.task('styles', function () {
	gulp.src(dir.dist.css)
		.pipe(plumber())
	//	.pipe(compass({
	//		css: dir.js.dest,
	//		sass: dir.sass.compassSrc
	//	}))
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie9', 'opera 12.1', 'ios 6'))
	//	.pipe(rename('whenwemeet.css'))
	//	.pipe(gulp.dest(dir.js.dest))
		.pipe(minifycss())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(dir.js.dest));
	//.pipe(gulp.dest(dir.www.dist));
});
gulp.task('clean', function () {
	del([dir.js.dest + 'whenwemeet.min.js', dir.js.dest + 'whenwemeet.js']);
});

gulp.task('js:concat', function () {
	gulp
		.src([
			'public/js/wwm.js',
			'public/js/wwm.model.js',
			'public/js/wwm.shell.js',
			dir.js.src
		])
		.pipe(plumber())
		.pipe(concat(dir.js.filename))
		//.pipe(gulp.dest(dir.www.dist))
		.pipe(gulp.dest(dir.js.dest));
});
gulp.task('js:uglify', ['js:concat'], function () {
	gulp.src(dir.js.dest + dir.js.filename)
		.pipe(plumber())
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		//.pipe(gulp.dest(dir.www.dist))
		.pipe(gulp.dest(dir.js.dest));
});
gulp.task('dust', function () {
	gulp.src('views/index.dust')
		.pipe(plumber())
		.pipe(dusthtml({
			whitespace: true,
			data: {
				title: '우리언제만나'
			}
		}))
		.pipe(gulp.dest('public/'))
		//.pipe(gulp.dest(dir.www.index))
		.pipe(livereload());
	//gulp.src('public/wwm.appcache')
	//	.pipe(gulp.dest(dir.www.index));
});
