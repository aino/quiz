var Backbone = require('backbone')

var Router = Backbone.Router.extend({
  initialize: function() {
    this.route(/(.*)\/+$/, "trailFix", function (id) {
      // remove all trailing slashes if more than one
      this.navigate(id.replace(/(\/)+$/, ''), true);
    })
  },
  routes: {
    "": "home",
    ":quiz": "quiz",
    ":quiz/end": "end"
  }
})

var router = new Router()
router.history = []

module.exports = router