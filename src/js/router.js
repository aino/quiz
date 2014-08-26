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
    "earth(/:city)(/:area)": "earth",
    "*notFound": "404"
  }
})

var router = new Router()
router.history = []

module.exports = router