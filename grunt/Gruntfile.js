module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    var lessFiles = [
            "less/base.less",
            "less/main-nav-block.less",
            "less/blocks/base/*.less",
            "less/blocks/*.less",
            "less/blocks/**/*.less",
            "blocks/**/*.less",
            "less/plugins/*.less"
        ],

        jsFiles = [
            "js/widgets/**/*.js",
            "js/core.js",
            "blocks/**/*.js"
        ];

    grunt.initConfig({

        // страница которая будет компилироваться. По-умолчанию *, т.е. все страницы
        compiledPage: '*',

        pkg: grunt.file.readJSON("package.json"),

        // Конкатенация файлов
        concat: {
            jade: {
                src: ['jade/blocks/base/*.jade', 'jade/blocks/*.jade', 'blocks/**/*.jade'],
                dest: 'jade/_mixins/_mixins.jade'
            },
            less: {
                src: lessFiles,
                dest: 'less/_main.less'
            }
        },

        // Шаблонизатор jade
        jade: {
            compile: {
                options: {
                    pretty: true
                },
                expand: true,
                flatten: true,
                src:  "jade/<%= compiledPage %>.jade",
                dest: "../html",
                ext: ".html"
            }
        },

        // Препроцессор CSS LESS
        less: {
            dev: {
                src: "less/_main.less",
                dest: "../assets/css/main.css"
            }
        },

        uglify: {
            my_target: {
                files: [{
                    expand: true,
                    cwd: 'js',
                    src: '**/*.js',
                    dest: '../assets/js'
                }]
            }
        },

        cssmin: {
            options: {
                shorthandCompacting: false
            },
            combine: {
                files: {
                    '../assets/css/main_min_original.css': ['../assets/css/main.css']
                }
            }
        },

        watch: {
            options: {
                spawn: false,
                reload: true
            },
            jade: {
                files: ['jade/<%= compiledPage %>.jade', 'jade/blocks/*.jade', 'jade/blocks/base/*.jade','jade/layouts/*.jade','blocks/**/*.jade'],
                tasks: ['concat:jade', 'jade']
            },
            less: {
                files: lessFiles,
                tasks: ['concat:less', 'less', 'autoprefixer:prod', 'cssmin', 'bless']
            },
            js: {
                files: jsFiles,
                tasks: ['uglify']
            }
        },

        autoprefixer: {
            // в режиме разработки добавляем префиксы только для последних версий браузеров
            dev: {
                options: {
                    browsers: ['last 1 version']
                },
                src: '../assets/css/main.css'
            },
            // добавляем префиксы всем необходимым браузерам
            prod: {
                options: {
                    browsers: ['> 1%', 'last 4 versions', 'Firefox ESR', 'Opera 12.1']
                },
                src: '../assets/css/main.css'
            }
        },

        browserSync: {
            dev: {
                bsFiles: {
                    src : ["/assets/css/main.css", '/assets/js/**/*.js', '/html/*.html']
                },
                options: {
                    server: {
                        baseDir: "../",
                        directory: true,
                        index: "/html/index.html"
                    },
                    watchTask: true,
                    open: false,
                }
            }
        },

        copy: {
            fonts:{
                expand:  true,
                flatten: false,
                cwd:    'fonts/',
                src:     ['**'],
                dest:   '../assets/fonts'
            },
            images:{
                expand:  true,
                flatten: false,
                cwd:    'images/',
                src:     ['**'],
                dest:   '../assets/images'
            },
            css:{
                expand:  true,
                flatten: false,
                cwd:    '../assets/css',
                src:     ['**'],
                dest:   '../assets/css' 
            },
            js:{
                expand:  true,
                flatten: false,
                cwd:    '../assets/js',
                src:     ['**'],
                dest:   '../assets/js' 
            }
        },

        bless: {
            css: {
              options: {},
              files: {
                '../assets/css/main_min.css': '../assets/css/main_min_original.css'
              }
            }
        }

    });

    /* ДЕФОЛТНЫЙ ТАСК ДЛЯ РАЗРАБОТКИ. */
    grunt.registerTask('default', function () {
        // Что бы при изменении одной страницы не компилировались все имеющиеся страницы
        // мы может передать имя страницы для компиляции используя ключ --page
        grunt.config.set('compiledPage', grunt.option('page') || '*');
        
        // Выполняем дефолтные таски
        grunt.task.run(['concat', 'jade', 'less', 'autoprefixer:prod', 'uglify', 'copy', 'browserSync', 'watch']);
    });

    /* Таск без сборки html */
    grunt.registerTask('jc', function () {
        grunt.task.run(['concat', 'less', 'autoprefixer:prod', 'uglify', 'copy', 'browserSync:dev', 'cssmin', 'bless', 'watch']);
    });

    // Таск сброрки только html
    grunt.registerTask('html', function () {
        grunt.task.run(['jade']);
    });

    //TODO настроить продакшн таск
    grunt.registerTask('prod', ['concat', 'less', 'autoprefixer:prod', 'uglify', 'copy', 'cssmin', 'bless']);
};
