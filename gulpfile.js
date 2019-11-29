const exec = require('child_process').exec;
const gulp = require('gulp');
const babel = require('gulp-babel');
const css = require('gulp-clean-css');
const livereload = require('gulp-livereload');
const electron = require('electron-connect').server.create();
// 1. Copy the index.html as is
// 2. Compile CSS file and move them to the app folder
gulp.task('css', () => { // 2.
    return gulp.src('assets/**/*.css')
        .pipe(css())
        .pipe(gulp.dest('app/'));
});
gulp.task('html', () => { // 2.
    return gulp.src('assets/**/*.html')
        .pipe(gulp.dest('app/'));
});
// 3. Compile JS files and move them to the app folder
gulp.task('js', () => { // 3.
    return gulp.src('assets/**/*.js')
         .pipe(babel())
         .pipe(gulp.dest('app/'));
});
// 4. Start the electron process.
gulp.task('start', gulp.series('html', 'css', 'js', () => { // 4.
    return exec(
        __dirname+'/node_modules/.bin/electron .'
    ).on('close', () => process.exit());
}));

gulp.task('copy', () => {
    return gulp.src('icons/**/*')
        .pipe(gulp.dest('app/icons'));
});

gulp.task('watch', async function() {
    livereload.listen();
    electron.start();
    gulp.watch('assets/**/*.html', gulp.series('html'), electron.reload);
    gulp.watch('assets/**/*.css', gulp.series('css'), electron.reload);
    gulp.watch('assets/**/*.js', gulp.series('js'), electron.reload);
    gulp.watch('assets/js/main.js', gulp.series('js'), electron.restart);
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
          __dirname+'/node_modules/.bin/electron-builder .'
      ).on('close', () => process.exit());
  }));

  function reloadJS(){
    gulp.series('js');
    //electron.reload;
  }