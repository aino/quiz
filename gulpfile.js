// Load plugins
var path = require('path')
var gulp = require('gulp')
var gutil = require('gulp-util')
var autoprefixer = require('gulp-autoprefixer')
var minifycss = require('gulp-minify-css')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var concat = require('gulp-concat')
var cache = require('gulp-cache')
var supervisor = require('gulp-supervisor')
var shell = require('shelljs')
var htmltemplate = require('gulp-template')
var htmlminify = require('gulp-minify-html')
var browserify = require('browserify')
var less = require('gulp-less')
var es = require('event-stream')
var streamqueue = require('streamqueue')
var source = require('vinyl-source-stream')
var buffer = require('gulp-buffer')
var watch = require('gulp-watch')

var pjson = require('./package.json')
var config = require('./conf/config')

// Check if installed version of node is enough. Need >=0.11
// Else, check if n is installed and use that
var nodeversion = process.version
var nodepath = ''
if ( ~~nodeversion.match(/\d+\.(\d+)/)[1] > 10 ) {
  nodepath = shell.which('node')
} else if (shell.which('n')) {
  nodeversion = pjson.engines.node
  nodepath = shell.exec( 'n bin ' + nodeversion, { silent: true } ).output
} else {
  gutil.log('n not found. Please install it to enable node versioning.')
  process.exit(1)
}

//////////////

// Echo to HTML
var echo = function(obj) {
  return gulp.src(config.src + 'html/*.html')
    .pipe(htmltemplate(obj, {
      'interpolate': /{{([\s\S]+?)}}/g
    }))
    .pipe(htmlminify(opts))
    .pipe(gulp.dest(config.public))
}

// Raise error
var raise = function(err) {
  err = err.stack || err
  gutil.log(err)
  echo({ 
    errmsg: '<code style="font-size:14px">'+err+'</code><style>#app{display:none!important}</style>',
    appname: 'Error'
  })
}

// Create Browserify stream
var gulpBrowserify = function(options, bundleOptions, commands) {
  var b
  options.extensions || (options.extensions = ['.js'])
  bundleOptions || (bundleOptions = {})
  b = browserify(options)

  for ( cmd in commands ) {
    gutil.log('Browserify running ' + cmd  + ':')
    values = commands[cmd]
    if ( typeof values === 'string' ) values = [values]
    values.forEach(function(value) {
      gutil.log('b[' + cmd + '](' + value + ')')
      b[cmd](value)
    })
  }
  return b.bundle(bundleOptions)
}

//////
// create tasks

var task = {}

task.html = function() {
  return echo({
    errmsg: '',
    appname: pjson.name || 'Name your app'
  })
}

task.lib = function() {

  var scriptpaths = config.bowerjs.map(function(p) {
    return path.resolve('bower_components', p)
  })
  var stylepaths = config.bowercss.map(function(p) {
    return path.resolve('bower_components', p)
  }).concat(config.libcss.map(function(p) {
    return config.src + 'css/'+p
  }))

  return es.concat(
    streamqueue({ objectMode: true },
      gulp.src(scriptpaths),
      gulpBrowserify({
        noParse: ['jquery','underscore','backbone']
      },{
        //detectGlobals: false
      },{
        'require': config.npmjs
      }).pipe(source()).pipe(buffer())
    )
      .pipe(concat('lib.js'))
      //.pipe(uglify())
      .pipe(gulp.dest(config.public + 'assets')),
    gulp.src( stylepaths )
      .pipe(concat('lib.css'))
      .pipe(minifycss())
      .pipe(gulp.dest(config.public + 'assets'))
  )
}

task.app = function(cb) {
  var apppath = path.resolve( config.src, 'js/index.js' )
  return es.concat(

    gulpBrowserify({
      entries: apppath
    },{
      debug: false
    },{
      // Methods
      'external': config.npmjs,
      'transform': ['reactify', 'debowerify']
    })
      .on('error', raise)
      .pipe(source(apppath))
      .pipe(buffer())
      .pipe(rename('app.js'))
      //.pipe(uglify())
      .pipe(gulp.dest(config.public + 'assets')),

    task.html(),

    gulp.src( config.src + 'js/loader.js' )
      .pipe(rename('load'))
      .pipe(uglify({mangle:false}))
      .pipe(gulp.dest( config.public + 'assets' ))
  )
}

task.styles = function() {
  return gulp.src(config.src + 'css/app.css')
    //.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 2')) // <!-- production
    .pipe(less({ sourceMap: true, silent: true }))  // <-- development
    .pipe(rename('app.css'))
    //.pipe(minifycss()) // <-- production
    .pipe(gulp.dest(config.public + 'assets'))
}

task.assets = function() {
  return gulp.src(config.src + 'assets/**/*')
    .pipe(gulp.dest(config.public + 'assets'))
}

task.watch = function() {
  watch({glob: config.src + 'js/**/*'}, function() { task.app() })
  watch({glob: config.src + 'html/**/*.html'}, function() { task.html() })
  watch({glob: config.src + 'css/**/*.css'}, function() { task.styles() })
  watch({glob: config.src + 'assets/**/*'}, function() { task.assets() })
}

task.supervisor = function() {
  supervisor('server/app.js', {
    args: [],
    watch: [ 'node_modules', 'server', 'conf' ],
    extensions: [ 'js', 'json' ],
    exec: nodepath,
    debug: false,
    harmony: true,
    noRestartOn: 'error',
    quiet: false
  } )
}

gulp.task( 'libs', function() {
  task.lib()
  gutil.log( 'Libs built' )
})

gulp.task( 'default', function() {
  task.watch()
  task.supervisor()
  gutil.log( 'Running server on ' + config.port )
})