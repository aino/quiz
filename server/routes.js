var fs = require('fs')
var _ = require('underscore')
var redis = require('redis')
var config = require('../conf/config')
var results = require('../src/js/results')

var db = redis.createClient()
db.on('error', function(err) {
  throw err
})

var seo = function(req, obj) {
  var base = req.protocol + '://' + req.get('host')
  obj = obj || {}
  return {
    title: obj.title || 'Quiz',
    description: obj.description || '',
    url: base + req.originalUrl,
    image: obj.image || ''
  }
}

var createUid = function(cb) {
  var generate = function() {
    return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0
      var v = c == 'x' ? r : (r&0x3|0x8)
      return v.toString(16)
    })
  }
  var tries = 0
  var check = function() {
    if ( ++tries == 500 )
      throw 'Max tries for uid'
    var uid = generate()
    db.get(uid, function(err, reply) {
      if ( err ) 
        throw err
      if ( reply === null )
        cb(uid)
      else
        check()
    })
  }
  db.select(config.redis, function(err) {
    if ( err ) 
      throw err
    check()
  })  
}

exports.quizdata = function(req, res, next) {
  var quiz = req.params.quiz
  if ( !quiz )
    throw 'No slug'
  fs.readFile(__dirname + '/db/' + quiz + '.json', function(err, data) {
    if ( err )
      throw err
    res.json({
      quiz: JSON.parse(data.toString())
    })
  })
}

exports.results = function(req, res, next) {
  db.select(config.redis, function(err) {
    if ( err ) 
      throw err
    var body = req.body
    db.set(body.uid, JSON.stringify(body.answers), function(err, reply) {
      if ( err )
        throw err
      res.json(body)
    })
  })
}

exports.uid = function(req, res, next) {
  createUid(function(uid) {
    db.set(uid, JSON.stringify([]), function(err, reply) {
      if ( err )
        throw err
      res.json({
        uid: uid
      })
    })
  })
}

exports.index = function(req, res, next) {
  var quizes = []
  fs.readdir(__dirname+'/db', function(err, fileNames) {
    if (err) throw err
    fileNames.forEach(function(filename) {
      quizes.push(filename.replace(/\.json$/,''))
    })
    res.render('index', {
      quizes: quizes,
      title: 'Quiz',
      seo: seo(req, { title: 'Quiz'})
    })
  })
}

exports.quiz = function(req, res, next) {
  var slug = req.params.quiz
  var id = req.params.id
  fs.readFile(__dirname + '/db/' + slug + '.json', 'utf8', function(err, quiz) {
    if ( err )
      res.status(404).end()

    if ( !quiz )
      res.end()

    if ( id ) {
      db.select(config.redis, function(err) {
        if ( err ) 
          throw err
        db.get(id, function(err, reply) {
          if ( err ) 
            throw err
          var answers = reply ? JSON.parse(reply) : []
          res.render('quiz', {
            quiz: quiz,
            seo: seo(req, {
              title: 'Score: ' + results(answers) // todo: define SEO tags for clickbate
            }),
            title: quiz.title
          })
        })
      })
    } else {
      res.render('quiz', {
        quiz: quiz,
        seo: seo(req, quiz),
        title: quiz.title
      })
    }
  })
}