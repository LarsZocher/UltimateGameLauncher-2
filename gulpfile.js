const exec = require('child_process').exec;
const gulp = require('gulp');
const babel = require('gulp-babel');
const css = require('gulp-clean-css');
const livereload = require('gulp-livereload');
const electron = require('electron-connect').server.create();

gulp.task('scss', () => {
    return exec("npm run scss-dev");
});

gulp.task('css', () => {
    setTimeout(()=>{
        electron.reload();
    }, 100);
    return gulp.src('assets/**/*.css')
        .pipe(css())
        .pipe(gulp.dest('app/'));
});
gulp.task('html', () => {
    setTimeout(()=>{
        electron.reload();
    }, 100);
    return gulp.src('assets/**/*.html')
        .pipe(gulp.dest('app/'));
});

gulp.task('js', () => {
    setTimeout(()=>{
        electron.reload();
    }, 1000);
    return gulp.src('assets/**/*.js')
         .pipe(babel())
         .pipe(gulp.dest('app/'));
});

gulp.task('start', gulp.series('html', 'css', 'js', () => { // 4.
    return exec(
        __dirname+'/node_modules/.bin/electron .'
    ).on('close', () => process.exit());
}));

gulp.task('copy', () => {
    return gulp.src('assets/icons/**/*')
        .pipe(gulp.dest('app/icons'));
});

gulp.task('watch', async function() {
    livereload.listen();
    electron.start();

    exec("gulp build");

    gulp.watch('assets/**/*.html', gulp.series('html'));
    gulp.watch('assets/**/*.css', gulp.series('css'));
    gulp.watch('assets/**/*.scss', gulp.series('scss'));
    gulp.watch('assets/**/*.js', gulp.series('js'));
    gulp.watch('assets/js/main.js', gulp.series('js'), electron.restart);

    //electron.on('close', ()=> process.exit());
  });
  
  gulp.task('build', gulp.series('copy', 'html', 'css', 'js'));
  
  gulp.task('start', gulp.series('build', () => {
      return exec(
          __dirname+'/node_modules/.bin/electron .'
      ).on('close', () => process.exit());
  }));
  
  gulp.task('default', gulp.parallel('start', 'watch'));
  
  gulp.task('release', gulp.series('build', () => {
      return exec(
          __dirname+'/node_modules/.bin/electron-builder --win'
      ).on('close', () => process.exit());
  }));