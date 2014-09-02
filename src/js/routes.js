// Do the data APIs based on URLS and inject into Backbone
// The App will listen to all backbone changes and update the interface accordingly

var models = require('./models')

var Routes = {

  home: function(params) {
    return
  },
  quiz: function(params) {
    console.log(params)
  },
  end: function(params) {
    console.log('end', params)
  }
}

module.exports = Routes