let gulp = require('gulp'); //podpinamy gulpa
let browserSync = require('browser-sync').create(); //plugin do gulpa, aktualizuje widok w przegladarce
let connectPHP = require('gulp-connect-php'); //serwer php do gulpa
let sass = require('gulp-sass'); //preprocesor sassa
let sourcemaps = require('gulp-sourcemaps'); //pokazanie lini w scss w inspect, dodaje wpis do style.css
let autoprefixer = require('gulp-autoprefixer'); //automatyczne dodawanie prefixow w zaleznosci od zakresu przegladarek
let del = require('del'); //kasowanie folderu (dist)
let concat = require('gulp-concat'); //konkatenacja js i css
let cleanCSS = require('gulp-clean-css'); //plugin minifikacji css
let uglify = require('gulp-uglify'); //plugin minifikacji js
let imagemin = require('gulp-imagemin'); //optymalizacja obrazków
let changed = require('gulp-changed'); //optymalizacja obrazków, przetwarzanie tylko na zmienionych plikach
let htmlReplace = require('gulp-html-replace'); //optymalizacja html
let htmlMin = require('gulp-htmlmin'); //minifikacja html
let color = require('gulp-color'); //color for console :) BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE
let babel = require('gulp-babel'); //compile ES6 to ES5


let cfg = {
	src: 'src/',
	scssin: 'src/scss/**/*.scss',
	scssout: 'src/css/',
	dist: 'dist/',
	cssin: 'src/css/**/*.css',
	cssoutname: 'style.css',
	cssout: 'dist/css/',
	jsin: 'src/js/**/*.js',
	jsoutname: 'scripts.js',
	jsout: 'dist/js/',
	imgin: 'src/img/**/*.{jpg,jpeg,png,gif}',
	imgout: 'dist/img/',
	htmlin: 'src/*.html',
	htmlout: 'dist/',
	cssreplaceout: 'css/style.css',
	jsreplaceout: 'js/scripts.js',
	phpin: 'src/*.php',
	phpout: 'dist/'
}

/**
 * GULP LIVE
 */

gulp.task('sass', () => {
	return gulp.src(cfg.scssin)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 3 versions'], // http://browserl.ist/?q=last+3+versions
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(cfg.scssout))
		.pipe(browserSync.stream());
});
gulp.watch(cfg.scssin, gulp.parallel('sass'));

gulp.task('browser-sync', gulp.series('sass', () => {
	connectPHP.server({
			base: cfg.src,
			port: 8000,
			keepalive: true
		},
		() => {
			browserSync.init({
				proxy: '127.0.0.1:8000',
				// 	server: cfg.src,
				files: ['src/**/*.*'],
				browser: 'firefox',
				port: 4000,
			});
		}
	);
}));

gulp.task('default', gulp.parallel('browser-sync'));


/**
 * BUILD
 */

gulp.task('clean', () => {
	return del([cfg.dist]).then(paths => {
		console.log('Deleted files and folders:\n', paths.join('\n'));
	});
});

gulp.task('css', () => {
	return gulp.src(cfg.cssin)
		.pipe(concat(cfg.cssoutname)) //konkatenacja
		.pipe(cleanCSS()) //minifikacja
		.pipe(gulp.dest(cfg.cssout));
});

gulp.task('js', () => {
	return gulp.src(cfg.jsin)
		.pipe(concat(cfg.jsoutname)) //konkatenacja
		// .pipe(babel({
		// 	presets: ['@babel/env']
		// }))
		// .pipe(uglify({
		// 	mangle: {
		// 		reserved: ['$routeProvider', '$window', '$scope', '$html', '$location', '$timeout', '$sce', '$interval'] // AngularJS except
		// 	}
		// })) //minifikacja
		.pipe(gulp.dest(cfg.jsout));
});

gulp.task('img', () => {
	return gulp.src(cfg.imgin)
		.pipe(changed(cfg.imgout))
		.pipe(imagemin())
		.pipe(gulp.dest(cfg.imgout));
});

gulp.task('html', () => {
	return gulp.src(cfg.htmlin)
		.pipe(htmlReplace({
			// w wynikowym html zamieni linki do js/css między komentarzami na pliki podane poniżej (build:wlasciwoscObiektu)
			// <!-- build:css -->	<!-- endbuild -->
			// <!-- build:js -->	<!-- endbuild -->
			'css': cfg.cssreplaceout,
			'js': cfg.jsreplaceout
		}))
		.pipe(htmlMin({
			sortAttributes: true, //sortowanie atrybutów znaczników
			sortClassName: true, //sortowanie klas w class=""
			collapseWhitespace: true, //kasowanie białych znaków
		}))
		.pipe(gulp.dest(cfg.dist));
});

gulp.task('php', () => {
	return gulp.src(cfg.phpin)
		.pipe(gulp.dest(cfg.phpout));
});

gulp.task('fonts', () => {
	return gulp.src(cfg.src + 'fonts/**/*')
		.pipe(gulp.dest(cfg.dist + 'fonts/'));
});

gulp.task('build', gulp.series('clean', 'css', 'js', 'img', 'html', 'php', 'fonts', () => {
	console.log(color('[GULP]', 'GREEN'), color('Build finished!', 'BLUE'),color('[GULP]', 'GREEN'), color('Start PHP server', 'BLUE'));
	connectPHP.server({
		base: cfg.dist,
		port: 8001,
		keepalive: true,
		open: true
	});
}));