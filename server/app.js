var koa = require('koa')
var logger = require('koa-logger')
var route = require('koa-route')
var bodyParser = require('koa-body-parser')
var serve = require('koa-static')
var config = require('../conf/config')
var fs = require('co-fs')

var app = module.exports = koa()

app.use(logger())
app.use(bodyParser())
app.use(serve( config.public ))

app.use(route.get('/api/examples', function*() {
  // ... get object from database
  this.body = {result: []}
}))

app.use(function*() {
  var file = yield fs.readFile( config.public+'index.html' )
  this.status = 200
  this.type = 'text/html; charset=utf-8'
  this.body = file
})

if (!module.parent) app.listen(config.port);
