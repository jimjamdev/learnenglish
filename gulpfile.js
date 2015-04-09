var gulp = require('gulp');

// =============================
// Options for Development
// =============================
var $outputDest = "./app";
var useUncss = false;
var htmlOptions = {
    conditionals: true,
    comments: true
};

// =============================
// Include plugins
// =============================

// Browser Sync
var browserSync = require('browser-sync');

// Styles
var sass = require('gulp-sass');
var cmq = require('gulp-combine-media-queries');
var cssmin = require('gulp-cssmin');
var autoprefixer = require('gulp-autoprefixer');
var critical = require('critical');
var uncss = require('gulp-uncss');

// Javascript
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

// Assets
var imagemin = require('gulp-imagemin');
var svg2png = require('gulp-svg2png');


// Tools
var filter = require('gulp-filter');
var flatten = require('gulp-flatten');
var size = require('gulp-size');
var csso = require('gulp-csso');
var useref = require('gulp-useref');
var minifyHTML = require('gulp-minify-html');
var usemin = require('gulp-usemin');
var del = require('del');
var rev = require('gulp-rev');
var plumber = require('gulp-plumber');
var gulpif = require('gulp-if');
//var nodemon = require('gulp-nodemon');

// Templates
var htmlbars = require('gulp-htmlbars');
var wrap = require('gulp-wrap-amd');

// =============================
// Server
// =============================

// Static Server + watching scss/html files
gulp.task('serve', function() {
    browserSync({
        //proxy: "localhost:3000"
        server: $outputDest
    });
});


// =============================
// Styles
// =============================

gulp.task('styles', ['scss']);

gulp.task('scss', function () {
    gulp.src('app/css/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer('last 3 version'))
        //.pipe(uncss({
           // html: ['app/*.html'],
            //ignore: [/js/, /offcanvas/, /active/, /hover/, /scroll/, /focus/, /placeholder/, /owl/, /modal/, /open/],
            //media: ['*']
        //}))
        .pipe(cmq({
            log: true
        }))
        .pipe(cssmin())
        .pipe(gulp.dest('./app/css'))
        //.pipe(gulp.dest('./public/styles'))
        .pipe(size());
});


gulp.task('critical-css', function () {
    critical.generateInline({
        base: 'public/',
        src: 'index.html',
        css: ['app/css/main.css'],
        dest: 'styles/main.css',
        htmlTarget: 'index.html',
        width: 960,
        height: 400,
        minify: true
    });
});

// =============================
// Javascript
// =============================

gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe(uglify())
        .pipe(size())
});

// =============================
// HTML
// =============================


gulp.task('html', function () {
    var assets = useref.assets({searchPath: ['.tmp', 'app', '.']});

    return gulp.src('app/*.html')
        .pipe(plumber())
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', csso()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulpif('*.html', minifyHTML({conditionals: true, loose: true})))
        .pipe(gulp.dest('public'));
});


// =============================
// Assets: Fonts, Images, SVG
// =============================

gulp.task('fonts', function () {
    return gulp.src('./**/*')
        .pipe(filter('**/*.{eot,ttf,woff}'))
        .pipe(flatten())
        .pipe(gulp.dest('app/fonts'))
        .pipe(gulp.dest('public/fonts'))
        .pipe(size());
});

gulp.task('images',['svg2png'], function () {
    return gulp.src('./app/images/**/*')
        .pipe(filter('**/*.{png,svg,jpg,gif}'))
        .pipe(flatten())
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: true}]
        }))
        .pipe(gulp.dest('public/images'))
        .pipe(size());
});

gulp.task('svg2png', function () {
    gulp.src('./app/images/**/*.svg')
        .pipe(svg2png())
        .pipe(gulp.dest('public/images'))
});


// =============================
// Watch and Builds
// =============================

// This is needed to re-write the bower_components include URL within the template
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'bower_components'
        }))
        .pipe(gulp.dest('./public'));
});

gulp.task('copy-bower-components', function() {
    return gulp.src('./app/bower_components/**/*')
        .pipe(gulp.dest('public/bower_components'));
});

gulp.task('clean', function() {
    del([
        'scripts/**',
        'styles/**',
        'images/**',
        'fonts/**',
        '.html'
    ]);
});

gulp.task('watch',['serve'], function() {
    gulp.watch("app/**/*.scss", ['styles']);
    //gulp.watch("app/**/*.html", ['html']);
    gulp.watch("app/**/*.js", ['scripts']);
    gulp.watch("app/fonts/*", ['fonts']);
    gulp.watch("app/images/**/*", ['images']);

    gulp.watch("app/css/*.css", ['reload']);
    gulp.watch("app/scripts/*.js", ['reload']);
    gulp.watch("app/**/*.html", ['reload']);
});

gulp.task('reload', function () {
    browserSync.reload();
});

// Use this task to initialise the project
gulp.task('init', ['fonts', 'images']);

// Use this task when in development
gulp.task('default', ['watch']);

// Use this task to build the project
gulp.task('build', ['html', 'fonts', 'images']);