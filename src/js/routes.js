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
      models.quizes.add(response.quiz)
    })
  }
}

module.exports = Routes