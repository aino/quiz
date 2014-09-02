var express = require('express')
var http = require('http')
var consolidate = require('consolidate')
var routes = require('./routes')
var config = require('../conf/config')
var fs = require('fs')
var handlebars = require('handlebars')

var app = express()

app.engine( 'html', consolidate.handlebars )
app.set( 'view engine', 'html' )
app.set( 'views', __dirname + '/views' )

// Handlebars partials
var partialsDir = __dirname + '/views/partials'
var filenames = fs.readdirSync(partialsDir)
filenames.forEach(function(filename) {
  var matches = /^([^.]+).html$/.exec(filename)
  if (!matches) return
  var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8')
  handlebars.registerPartial(matches[1], template)
})

app.use(express.static(__dirname + '/../public'))
app.get('/', routes.index)
app.get('/:quiz', routes.quiz)

var server = http.createServer(app)
server.listen(config.port, function() { console.log('Running on port ' + config.port) })