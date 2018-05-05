/*
Если каталог node_modules отсутствует и "ничего не работает", просто в cmd выполняем: npm i
npm сам затянет все зависимости.
*/

var gulp				 = require('gulp'), // Подключаем Gulp
		sass				 = require('gulp-sass'), //Подключаем Sass пакет
		browserSync	 = require('browser-sync'), // Подключаем Browser Sync
		concat			 = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
		uglify			 = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
		cssnano			 = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
		rename			 = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
		del					 = require('del'), // Подключаем библиотеку для удаления файлов и папок
		imagemin		 = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
		pngquant		 = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
		cache				 = require('gulp-cache'), // Подключаем библиотеку кеширования
		autoprefixer = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
		pug					 = require('gulp-pug'); // Подключаем Pug

/* Задача переброса *.PUG-ов из APP/PUG в корень APP в формате HTML */
gulp.task('pug', function() {
	return gulp.src("app/pug/*.pug") // откуда нужно взять файлы
		.pipe(pug({pretty: true})) // html на выходе будет отформатирован
		.pipe(gulp.dest("app")) // куда класть готовые html
		.pipe(browserSync.reload({ // обновить в браузре
		stream: true
	}))
});

/* Задача переброса *.SaSS-ов из APP/SASS в APP/CSS в формате CSS */
gulp.task('sass', function () {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) // expanded - развёрнутый, compact, compressed, nested
 	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({
		stream: true
	}))
});

/* Задача объединения JS-файлов из app/libs в один файл с последующей минификацией и копированием в app/js*/
gulp.task('scripts', function () {
	return gulp.src([
	 'app/libs/jquery/dist/jquery.min.js',
	])
 .pipe(concat('libs.min.js'))
 .pipe(uglify()) // минификатор (сжатие файла)
 .pipe(gulp.dest('app/js'))
});

/* Задача минификации css. */
gulp.task('css-libs', ['sass'], function () { // то что в квадратных скобках, будет выполнено ДО основного таска
 	return gulp.src('app/css/libs.css')
 	.pipe(cssnano())
 	.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
 	.pipe(gulp.dest('app/css'));
});

/* Запуск сервера browser-sync, при изменении в файлах, тут-же будет обновлено в баузере */
gulp.task('browser-sync', function () { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	});
});

/* Задача очистки директории DIST перед сборкой проекта  */
gulp.task('clean', function () {
	return del.sync('dist');
});

/* Задача очистки кэша. Если ооочень много фотографий, при сжатии будут большие тормоза, юзаем для этого кэш */
gulp.task('clear', function () {
	return cache.clearAll();
});


gulp.task('img', function () {
	return gulp.src('app/img/**/*') // Берем все изображения из app
	.pipe(cache(imagemin({ // С кешированием
	// .pipe(imagemin({ // Сжимаем изображения без кеширования
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		une: [pngquant()]
	}))/**/)
 .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

/* Задача наблюдения  */
gulp.task('watch', ['browser-sync', 'css-libs', 'scripts', 'pug'], function () {
	gulp.watch('app/sass/**/*.sass', ['sass']); // Наблюдение за sass файлами в папке sass
	gulp.watch('app/pug/**/*.pug', ['pug']);// Наблюдение за PUG файлами в папке PUG
	gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('app/js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
});

/*  Задача сборки проекта  */
gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function () {
	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
	 'app/css/main.css',
	 'app/css/libs.min.css',
	])
	.pipe(gulp.dest('dist/css'));
 
	var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
		.pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
		.pipe(gulp.dest('dist/js'));

	var buildHTML = gulp.src('app/*.html') // Переносим HTML в продакшен
		.pipe(gulp.dest('dist'));
});