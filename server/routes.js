var fs = require('fs')
var _ = require('underscore')

var seo = function(req, quiz) {
  var base = req.protocol + '://' + req.get('host')
  return {
    title: quiz.name,
    url: base + req.originalUrl,
    image: ''
  }
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
  fs.readFile(__dirname + '/db/' + slug + '.json', function(err, data) {
    if ( err )
      res.send(404)
    var quiz = JSON.parse(data.toString())
    res.render('quiz', {
      quiz: quiz,
      seo: seo(req, quiz),
      title: quiz.name
    })
  })
}