// Do the data APIs based on URLS and inject into Backbone
// The App will listen to all backbone changes and update the interface accordingly

var models = require('./models')
var Ajax = require('./ajax')

var Routes = {

  home: function(params) {
    return
  },
  quiz: function(params) {
    Ajax.get('/api/quiz/'+params.paths[0]).success(function(response) {
      var quiz = response.quiz
      quiz.questions = quiz.questions.map(function(q) {
        q.answers = q.answers.map(function(a,i) {
          return {
            a:a,
            i:i
          }
        }.bind(this))
        q.answers.sort(function() { return .5 - Math.random() })
        return q
      })
      models.quizes.add(quiz)
    })
  }
}

module.exports = Routes