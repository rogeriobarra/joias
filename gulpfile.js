var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var cleancss = require('gulp-clean-css');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var autoPrefixer = require('gulp-autoprefixer');
var gulpInject = require('gulp-inject');
var tinypngs = require('gulp-tinypng-compress');
var stramSeries = require('stream-series');







/*************************
    DEFAULT TASKS
**************************/

/* Serve */
function serve(done) {
    browserSync.init({
        server: {
            baseDir: './src'
        }
    })
    done();
}

/* Sass Compiler */
function sassCompile(done) {
    gulp.src('./src/assets/sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(autoPrefixer('last 10 versions'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./src/assets/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
    done();
}

/* Reload */
function reload(done) {
    browserSync.reload();
    done();
}

/* Watch Files */
function watchFiles(done) {
    gulp.watch('./src/assets/sass/**/*.scss', sassCompile);
    gulp.watch('./src/*.html', reload);
    gulp.watch('./src/assets/js/**/*.js', reload);
    done();
}





/*************************
    DIST TASKS
**************************/

/* Optimize Images */
function distImageOptimize(done) {
    gulp.src('./src/assets/images/**/*.{png,jpg,jpeg}')
        .pipe(tinypngs({
            key: 'xYMAfkMBuKzyZZdshqwIuYfv8I8bmWBe',
            sigFile: './src/images/.tinypng-sigs',
            log: true
        }))
        .pipe(gulp.dest('./dist/assets/images'));

    gulp.src('./src/assets/images/**/*.{gif,ico,svg}')
        .pipe(gulp.dest('./dist/assets/images'));

    done();
}


/* Move Fonts */
function distFonts(done) {
    gulp.src('./src/assets/fonts/*').pipe(gulp.dest('./dist/assets/fonts'));
    done();
}


/* Move Php Files */
function distPhp(done) {
    gulp.src('./src/assets/php/*').pipe(gulp.dest('./dist/assets/php'));
    done();
}


/* Move css with minify */
function distCss(done) {
    gulp.src('./src/assets/css/**/*.css')
        .pipe(cleancss({
            rebase: false
        }))
        .pipe(gulp.dest('./dist/assets/css'));

    gulp.src('./src/assets/css/style.css')
        .pipe(cleancss({
            rebase: false
        }))
        .pipe(gulp.dest('./dist/assets/css'));

    done();
}


/* Move js with minify */
function distJs(done) {
    gulp.src('./src/assets/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist/assets/js'));
    done();
}


/* Move HTML files */
function distHTML(done) {
    gulp.src('./src/*.html')
        .pipe(gulp.dest('dist'));

    done();
}




/*************************
    BUILD TASKS
**************************/

/* Optimize Images */
function buildImageOptimize(done) {
    gulp.src('./src/assets/images/**/*.{png,jpg,jpeg}')
        .pipe(tinypngs({
            key: 'xYMAfkMBuKzyZZdshqwIuYfv8I8bmWBe',
            sigFile: './src/images/.tinypng-sigs',
            log: true
        }))
        .pipe(gulp.dest('./build/assets/images'));

    gulp.src('./src/assets/images/**/*.{gif,ico,svg}')
        .pipe(gulp.dest('./build/assets/images'));

    done();
}


/* Move Fonts */
function buildFonts(done) {
    gulp.src('./src/assets/fonts/*').pipe(gulp.dest('./build/assets/fonts'));
    done();
}

/* Move Php Files */
function buildPhp(done) {
    gulp.src('./src/assets/php/*').pipe(gulp.dest('./build/assets/php'));
    done();
}


function buildCss(done) {
    gulp.src('./src/assets/css/style.css')
        .pipe(cleancss())
        .pipe(gulp.dest('./build/assets/css'));

    gulp.src('./src/assets/css/vendors/*.css')
        .pipe(concat('plugins.min.css'))
        .pipe(cleancss())
        .pipe(gulp.dest('./build/assets/css/vendors'));

    done();
}


/* Move js with minify */
function buildJs(done) {
    gulp.src('./src/assets/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./build/assets/js'));

    gulp.src(['./src/assets/js/vendors/jquery-3.3.1.min.js', './src/assets/js/vendors/*.js'])
        .pipe(concat('plugins.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./build/assets/js/vendors'));

    done();
}


/* Move HTML files */
function buildHTML(done) {
    gulp.src('./src/*.html')
        .pipe(gulp.dest('./build'));

    done();
}


/* Inject Files */
function injectFiles(done) {
    var vendorStream = gulp.src(['./build/assets/css/vendors/**', './build/assets/js/vendors/**'], {
        read: false
    });
    var appStream = gulp.src(['./build/assets/css/*', './build/assets/js/*'], {
        read: false
    });

    gulp.src('./build/*.html')
        .pipe(gulpInject(stramSeries(vendorStream, appStream), {
            relative: true
        }))
        .pipe(gulp.dest('./build'));

    done();
}


/* Tasks */
gulp.task("default", gulp.parallel(serve, sassCompile, watchFiles));
gulp.task("dist", gulp.parallel(distImageOptimize, distFonts, distPhp, distCss, distJs, distHTML));
gulp.task("build", gulp.series(buildHTML, buildFonts, buildPhp, buildCss, buildJs, buildImageOptimize));
gulp.task("buildfinal", injectFiles);